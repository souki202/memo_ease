import json
import boto3
import os
import uuid
import datetime
import time
import secrets
import base64
import re
import mimetypes
from enum import Enum
from boto3.dynamodb.conditions import Key
from botocore.config import Config
from common_headers import *
from my_common import *
import model.file as my_file

s3_resource = boto3.resource('s3')
s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
FILE_BUCKET_NAME = 'memo-ease-storage' + os.environ['FileStorageBucketSuffix']
storageBucket = s3_resource.Bucket(FILE_BUCKET_NAME)
FILES_KEY = 'files'
MEMOS_KEY = 'memos'

'''
画像を保存するためのurlを作成

@return {str, str} 作成したファイル名(key), url
'''
def create_put_url_and_record(memo_uuid, file_name, file_size):
    if not memo_uuid or file_name or file_size:
        return False
    ext = ''
    if file_name:
        ext = os.path.splitext(file_name)[1]

    # ファイルの置き場所のキーを作成
    new_file_name = secrets.token_urlsafe(64)
    new_file_name = re.sub("[^\w\-*().]", '_', new_file_name)
    key = memo_uuid + '/' + FILES_KEY + '/' + new_file_name + ext

    # mime_typeを取得
    mime_type = 'text/plain'
    if ext:
        mime_type = mimetypes.guess_type(new_file_name + ext)[0]

    try:
        signed_url = s3_client.generate_presigned_url(
            ClientMethod = 'put_object',
            Params = {
                'Bucket': FILE_BUCKET_NAME,
                'Key': key,
                'ContentType': mime_type
            },
            ExpiresIn = 30,
            HttpMethod = 'PUT',
        )
        if not my_file.add_file(new_file_name, memo_uuid, file_size, ext):
            raise 'failed to add record'
        return new_file_name, signed_url
    except Exception as e:
        print(e)
        return False

'''
メモの本文を保存する

@param str memo_uuid
@param str memo_body
@return {bool} 成功すればtrue
'''
def upload_memo_body(memo_uuid: str, memo_body: str) -> bool:
    if not memo_uuid:
        return False
    key = memo_uuid + '/body.txt'
    try:
        res = storageBucket.put_object(
            Body = memo_body,
            Key = key
        )
        return not not res
    except Exception as e:
        print(e)
        return False
    return False

'''
メモの本文を読み込む

@param str memo_uuid
@return {str} メモの本文
'''
def get_memo_body(memo_uuid: str) -> str:
    if not memo_uuid:
        return False
    key = memo_uuid + '/body.txt'
    try:
        obj = s3_client.get_object(Bucket=FILE_BUCKET_NAME, Key=key)
        body = obj['Body'].read()
        return body
    except Exception as e:
        print(e)
        return False
    return False