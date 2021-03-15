import json
import os
import uuid
import datetime
import time
import secrets
import base64
from enum import Enum
from common_headers import *
from model.auth import *
from my_common import *
from model.memo import *
import service.s3 as my_s3
import model.file as my_file
import service.memo as my_memo_service

MAX_UPLOAD_SIZE = 1024 * 1024 * 8

def file_event(event, context):
    if os.environ['EnvName'] != 'Prod':
        print(json.dumps(event))
    
    httpMethod = str.upper(event['httpMethod'])
    resource = str.lower(event['resource'])

    if httpMethod == 'POST':
        if resource == '/create_upload_url':
            return create_upload_url_event(event, context)

def create_upload_url_event(event, context):
    memo_data = my_memo_service.get_memo_data_with_auth(event)

    if not memo_data:
        return create_common_return_array(406, {'message': "Failed to get memo data.",})

    memo_uuid = memo_data['uuid']

    params = json.loads(event['body'] or '{ }')    
    file_name: str = params['params'].get('file_name', '')
    file_size: int = int(params['params'].get('file_size', 0))

    # バリデーション
    if not file_name or not file_size or file_size <= 0:
        return create_common_return_array(406, {'message': 'Insufficient input'})

    if file_size >= MAX_UPLOAD_SIZE:
        print('The upper limit is 8MB. filesize: ' + str(file_size))
        return create_common_return_array(403, {'message': 'The upper limit is 8MB'})

    # URL作成
    key, url = my_s3.create_put_url_and_record(memo_uuid, file_name, file_size)
    if not key or not url:
        print('Failed to create upload url. memo_uuid: ' + memo_uuid + ' file_name: ' + file_name + ' file_size: ' + str(file_size))
        return create_common_return_array(500, {'message': 'Failed to create upload url.'})
    
    return create_common_return_array(200, {'url': url, 'key': key})
