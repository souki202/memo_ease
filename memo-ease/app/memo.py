import json
import boto3
import os
import uuid
import datetime
import time
import secrets
from my_common import *
from common_headers import *
import model.memo as my_memo
import service.memo as my_memo_service
import model.file as my_file
import model.auth as my_auth
import service.s3 as my_s3

def memo_event(event, context):
    if os.environ['EnvName'] != 'Prod':
        print(json.dumps(event))
    
    httpMethod = str.upper(event['httpMethod'])
    resource = str.lower(event['resource'])

    if httpMethod == 'POST':
        if resource == '/create_memo':
            return create_memo_event(event, context)
        elif resource == '/get_memo':
            # パスワード送信があるのと, アクセス日更新の都合でpostする
            return get_memo_event(event, context)
        elif resource == '/save_memo':
            return save_memo_event(event, context)
        elif resource == '/update_password':
            return update_password_event(event, context)
    elif httpMethod == 'GET':
        if resource == '/check_has_password_memo':
            return check_has_password_memo_event(event, context)
        elif resource == 'check_exist_memo':
            return check_exist_memo_event(event, context)

    return create_common_return_array(404, {'message': 'Not Found',})

def create_memo_event(event, context):
    ip_address = event['requestContext']['identity']['sourceIp']

    # そのIPから作りすぎていないかチェック
    if not my_auth.check_create_history(ip_address):
        print('Reached the maximum number of creations. ip_address: ' + ip_address)
        return create_common_return_array(401, {'message': 'Reached the maximum number of creations.', 'limit': True})
    
    # メモ情報を作成
    new_memo_id = my_memo.create_memo()
    if not new_memo_id:
        print('Failed to create memo.')
        return create_common_return_array(500, {'message': 'Failed to create memo.',})

    # メモの本体を作成
    if not my_s3.upload_memo_body(new_memo_id, ''):
        print('Failed to create memo body file. memo_uuid: ' + new_memo_id)
        return create_common_return_array(500, {'message': 'Failed to create memo.',})

    # 作ったことを記録
    if not my_auth.add_create_history(ip_address):
        print('Failed to add create history: ip_address: ' + ip_address + ' memo_id: ' + new_memo_id)
        return create_common_return_array(500, {'message': 'Failed to create memo.',})

    #成功したのでメモIDを返す
    return create_common_return_array(200, {"memo_uuid": new_memo_id})

'''
メモ取得 (編集画面用)
'''
def get_memo_event(event, context):
    memo_data = my_memo_service.get_memo_data_with_auth(event)

    if not memo_data:
        return create_common_return_array(406, {'message': "Failed to get memo data.",})

    memo_uuid = memo_data['uuid']

    # 通過したので本文取得
    memo_body = my_s3.get_memo_body(memo_uuid)
    if memo_body == False:
        print('Failed to get memo body. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': "Failed to get memo data.",})

    if not my_memo.record_access(memo_uuid):
        print('Failed to record access. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': "Failed to get memo data.",})

    #成功したのでメモ情報を返す
    memo_data['body'] = memo_body
    del memo_data['password']
    return create_common_return_array(200, {"memo": memo_data})

def save_memo_event(event, context):
    params = json.loads(event['body'] or '{ }')
    if not params or not params.get('params'):
        return create_common_return_array(406, {'message': "Not enough input.",})

    memo_title = params['params'].get('title')
    memo_body = params['params'].get('body')

    # タイトル長さチェック
    if not my_memo_service.check_memo_title_length(memo_title):
        return create_common_return_array(406, {'message': "Reached the maximum title length.",})
    # 本文長さチェック
    if not my_memo_service.check_memo_body_length(memo_body):
        return create_common_return_array(406, {'message': "Reached the maximum body length.",})

    # メモの情報取得
    memo_data = my_memo_service.get_memo_data_with_auth(event)
    if not memo_data:
        return create_common_return_array(406, {'message': "Failed to get memo data.",})
    memo_uuid = memo_data['uuid']
    
    # 通過したので保存
    if not my_memo.update_memo(memo_uuid, memo_title):
        print('Failed to save memo information. memo_uuid: ' + memo_uuid + ' title: ' + memo_title)
        return create_common_return_array(500, {'message': "Failed to save memo.",})
    # 本文保存
    if not my_s3.upload_memo_body(memo_uuid, memo_body):
        print('Failed to create memo body file. memo_uuid: ' + memo_uuid)
        print(memo_body)
        return create_common_return_array(500, {'message': 'Failed to save memo.',})

    # 成功
    return create_common_return_array(200, {})

'''
パスワードがあるメモか調べる
'''
def check_has_password_memo_event(event, context):
    if not ('queryStringParameters' in event and event['queryStringParameters']):
        return create_common_return_array(406, {'message': "Not enough input.",})
    
    memo_uuid = event['queryStringParameters'].get('memo_uuid')
    memo_alias = event['queryStringParameters'].get('memo_alias')
    
    if not memo_uuid and not memo_alias:
        return create_common_return_array(406, {'message': "Not enough input.",})
    
    # 情報を取得
    memo_data = None
    if memo_uuid:
        memo_data = my_memo.get_memo(memo_uuid)
    elif memo_alias:
        memo_data = my_memo.get_memo_by_alias(memo_alias)
    if not memo_data:
        print('Failed to get memo data. memo_uuid: ' + memo_uuid)
        return create_common_return_array(404, {'message': "Not Found.",})
    
    #成功したので, パスワードがあるかだけ返す
    return create_common_return_array(200, {"has_password": bool(memo_data['password'])})

'''
存在するメモか調べる
'''
def check_exist_memo_event(event, context):
    if not ('queryStringParameters' in event and event['queryStringParameters']):
        return create_common_return_array(406, {'message': "Not enough input.",})
    
    memo_uuid = event['queryStringParameters'].get('memo_uuid')
    memo_alias = event['queryStringParameters'].get('memo_alias')
    
    if not memo_uuid and not memo_alias:
        return create_common_return_array(406, {'message': "Not enough input.",})
    
    # 情報を取得
    memo_data = None
    if memo_uuid:
        memo_data = my_memo.get_memo(memo_uuid)
    elif memo_alias:
        memo_data = my_memo.get_memo_by_alias(memo_alias)
    
    #成功したので, パスワードがあるかだけ返す
    return create_common_return_array(200, {"is_exist": bool(memo_data)})

def update_password_event(event, context):
    params = json.loads(event['body'] or '{ }')
    if not params or not params.get('params'):
        return create_common_return_array(406, {'message': "Not enough input.",})

    new_password = params['params'].get('newPassword')
    email = params['params'].get('email')
    
    # メモの情報取得
    memo_data = my_memo_service.get_memo_data_with_auth(event)
    if not memo_data:
        return create_common_return_array(406, {'message': "Failed to get memo data.",})
    memo_uuid = memo_data['uuid']

    # 取得できたらパスワードを更新
    if not my_memo.update_password(memo_uuid, new_password, email):
        print('Failed to update password. memo_uuid: ' + memo_uuid + ' email: ' + email)
        return create_common_return_array(500, {'message': 'Failed to update password.',})
    
    return create_common_return_array(200, {})

