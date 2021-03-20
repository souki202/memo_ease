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
import service.mail as my_mail

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
        elif resource == '/change_public_state':
            return change_public_state_event(event, context)
        elif resource == '/change_memo_alias':
            return change_memo_alias_event(event, context)
        elif resource == '/generate_reset_password_token':
            return generate_reset_password_token_event(event, context)
        elif resource == '/reset_password':
            return reset_password_event(event, context)
    elif httpMethod == 'GET':
        if resource == '/check_has_password_memo':
            return check_has_password_memo_event(event, context)
        elif resource == '/check_exist_memo':
            return check_exist_memo_event(event, context)
        elif resource == '/get_memo_data_by_view_id':
            return get_memo_data_by_view_id_event(event, context)

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
    return create_common_return_array(200, {'memo': memo_data})

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
    memo_data = my_memo_service.get_memo_data_without_auth(event)

    if memo_data == None:
        return create_common_return_array(404, {'message': 'Not Found.',})

    if not memo_data:
        return create_common_return_array(500, {'message': 'Failed to get memo.',})

    #成功したので, パスワードがあるかだけ返す
    return create_common_return_array(200, {"has_password": bool(memo_data['password'])})

'''
存在するメモか調べる
'''
def check_exist_memo_event(event, context):
    memo_data = my_memo_service.get_memo_data_without_auth(event)

    if memo_data == None:
        return create_common_return_array(404, {'message': 'Not Found.',})

    if not memo_data:
        return create_common_return_array(500, {'message': 'Failed to get memo.',})
    
    #成功
    return create_common_return_array(200, {"is_exist": True})

def update_password_event(event, context):
    # メモの情報取得
    memo_data = my_memo_service.get_memo_data_with_auth(event)
    if not memo_data:
        return create_common_return_array(406, {'message': 'Failed to get memo data.',})
    memo_uuid = memo_data['uuid']

    params = json.loads(event['body'] or '{ }')
    new_password = params['params'].get('newPassword')
    email = params['params'].get('email')

    # 取得できたらパスワードを更新
    if not my_memo.update_password(memo_uuid, new_password, email):
        print('Failed to update password. memo_uuid: ' + memo_uuid + ' email: ' + email)
        return create_common_return_array(500, {'message': 'Failed to update password.',})
    
    return create_common_return_array(200, {})

def change_public_state_event(event, context):
    # メモの情報取得
    memo_data = my_memo_service.get_memo_data_with_auth(event)
    if not memo_data:
        return create_common_return_array(406, {'message': 'Failed to get memo data.',})
    memo_uuid = memo_data['uuid']

    params = json.loads(event['body'] or '{ }')
    state = params['params'].get('state')

    if state == None:
        return create_common_return_array(406, {'message': "Not enough input.",})

    # 閲覧URL有効状態変更
    if not my_memo.change_public_state(memo_uuid, bool(state)):
        print('Failed to create view id. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': 'Failed to create view id.',})
    
    return create_common_return_array(200, {})


def get_memo_data_by_view_id_event(event, context):
    if not ('queryStringParameters' in event and event['queryStringParameters']):
        return create_common_return_array(406, {'message': "Not enough input.",})
    
    view_id = event['queryStringParameters'].get('view_id')

    if not view_id:
        return create_common_return_array(406, {'message': "Not enough input.",})

    memo_data = my_memo.get_memo_by_view_id(view_id)
    if not memo_data:
        print('Not Found by view_id. view_id: ' + view_id)
        return create_common_return_array(404, {'message': "Not Found.",})

    memo_uuid = memo_data['uuid']

    if not memo_data['is_public']:
        print('This memo is not public. memo_uuid: ' + memo_uuid)
        return create_common_return_array(404, {'message': "Not Found.",})

    # 本文取得
    memo_body = my_s3.get_memo_body(memo_uuid)
    if memo_body == False:
        print('Failed to get memo body. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': "Failed to get memo data.",})

    if not my_memo.record_access(memo_uuid):
        print('Failed to record access. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': "Failed to get memo data.",})

    return create_common_return_array(200, {'body': memo_body, 'title': memo_data['title']})

def change_memo_alias_event(event, context):
    # メモの情報取得
    memo_data = my_memo_service.get_memo_data_with_auth(event)
    if not memo_data:
        return create_common_return_array(406, {'message': 'Failed to get memo data.',})
    memo_uuid = memo_data['uuid']

    params = json.loads(event['body'] or '{ }')
    new_memo_alias = params['params'].get('new_memo_alias')

    # 文字数チェック
    if not my_memo_service.check_memo_alias_length(new_memo_alias):
        print('Alias can be up to 1000 characters. memo_uuid: ' + memo_uuid + ' old_alias: ' + memo_data['alias_name'] + ' new_alias: ' + new_memo_alias)
        return create_common_return_array(406, {'message': 'Alias can be up to 1000 characters. ',})


    if memo_data['alias_name'] == new_memo_alias:
        print('Same alias. memo_uuid: ' + memo_uuid + ' old_alias: ' + memo_data['alias_name'] + ' new_alias: ' + new_memo_alias)
        return create_common_return_array(406, {'message': 'Failed to update alias. ',})

    # 既にあるエイリアスか調べる
    if my_memo.get_is_exist_alias(new_memo_alias):
        print('Duplicate alias. memo_uuid: ' + memo_uuid + ' old_alias: ' + memo_data['alias_name'] + ' new_alias: ' + new_memo_alias)
        return create_common_return_array(406, {'message': 'Failed to update alias. ',})

    if not my_memo.change_memo_alias(memo_uuid, memo_data['alias_name'], new_memo_alias):
        print('Failed to update alias. memo_uuid: ' + memo_uuid + ' old_alias: ' + memo_data['alias_name'] + ' new_alias: ' + new_memo_alias)
        return create_common_return_array(500, {'message': 'Failed to update alias. ',})

    return create_common_return_array(200, {})

def generate_reset_password_token_event(event, context):
    memo_data = my_memo_service.get_memo_data_without_auth_post(event)
    if not memo_data:
        return create_common_return_array(500, {'message': 'Failed to get memo data.',})
    memo_uuid = memo_data['uuid']

    # リセットに必要な情報がなければ終了
    if not memo_data['email']:
        print('Email is not set. memo_uuid: ' + memo_uuid)
        return create_common_return_array(406, {'message': 'email is not set.',})

    if not memo_data['password']:
        print('Password is not set. memo_uuid: ' + memo_uuid)
        return create_common_return_array(406, {'message': 'Password is not set.',})

    # tokenを発行して登録
    token = my_memo.add_password_reset_token(memo_uuid)
    if not token:
        print('Failed to create password reset token. memo_uuid: ' + memo_uuid)
        return create_common_return_array(500, {'message': 'Failed to create token.',})
    
    # メール送信
    if not my_mail.send_reset_password_mail(memo_data['email'], token):
        print('Failed to send password reset mail. memo_uuid: ' + memo_uuid + ' email: ' + memo_data['email'])
        return create_common_return_array(500, {'message': 'Failed to create token.',})

    return create_common_return_array(200, {})

def reset_password_event(event, context):
    params = json.loads(event['body'] or '{ }')
    if not params:
        return create_common_return_array(406, {'message': 'Not enough input.',})

    token = params['params'].get('token')

    if not token:
        return create_common_return_array(406, {'message': 'token is not set.',})

    memo_uuid = my_memo_service.reset_password(token)
    if not memo_uuid:
        return create_common_return_array(500, {'message': 'Failed to reset password.',})

    return create_common_return_array(200, {'uuid': memo_uuid})
