import json
import boto3
import os
import uuid
import datetime
import time
import secrets
from my_common import *
from model.memo import my_memo
from model.file import my_file
from model.auth import my_auth
from service.s3 import my_s3

def memo_event(event, context):
    if os.environ['EnvName'] != 'Prod':
        print(json.dumps(event))
    
    httpMethod = str.upper(event['httpMethod'])
    resource = str.lower(event['resource'])

    if httpMethod == 'POST':
        if resource == '/create_memo':
            return create_memo_event(event, context)
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
