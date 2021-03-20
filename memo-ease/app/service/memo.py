import json
import boto3
import os
import uuid
import datetime
import time
import secrets
import concurrent.futures
from enum import Enum
from argon2 import PasswordHasher
from dynamo_utility import *
from my_common import *
import model.memo as my_memo
import model.auth as my_auth

MAX_TITLE_LENGTH = 1024
MAX_BODY_LEN = 1024 * 1024 * 4

'''
メモのタイトルの長さが正常かチェック

@param title メモのタイトル
@return {bool} 正常ならtrue
'''
def check_memo_title_length(title: str) -> bool:
    return len(title) <= MAX_TITLE_LENGTH

def check_memo_body_length(body: str) -> bool:
    return len(body) <= MAX_BODY_LEN

'''
パスワードチェック付きでメモの情報を取得 (本文以外)

@param dict event memo_uuidまたはmemo_aliasの値が必要. パスワードが設定されていればpasswordも.
@return {dict} メモの情報
'''
def get_memo_data_with_auth(event):
    params = json.loads(event['body'] or '{ }')
    if not params or not params.get('params'):
        return False
    
    memo_uuid = params['params'].get('memo_uuid', '')
    memo_alias = params['params'].get('memo_alias', '')
    if not memo_uuid and not memo_alias:
        return False
    
    password = params['params'].get('password')

    # 一旦情報を取得
    memo_data = None
    if memo_uuid:
        memo_data = my_memo.get_memo(memo_uuid)
    elif memo_alias:
        memo_data = my_memo.get_memo_by_alias(memo_alias)
    if not memo_data:
        print('Failed to get memo data. memo_uuid: ' + str(memo_uuid) + ' memo_alias: ' + str(memo_alias))
        return memo_data

    memo_uuid = memo_data['uuid']

    # パスワードチェック
    if not my_auth.check_memo_auth(password, memo_data['password']):
        print('Mismatch password. memo_id: ' + memo_uuid)
        return None

    return memo_data

'''
@param dict event get時のevent (post時は上のget_memo_data_with_authを使用)
'''
def get_memo_data_without_auth(event):
    if not ('queryStringParameters' in event and event['queryStringParameters']):
        return False
    
    memo_uuid = event['queryStringParameters'].get('memo_uuid', '')
    memo_alias = event['queryStringParameters'].get('memo_alias', '')
    
    if not memo_uuid and not memo_alias:
        return False
    
    # 情報を取得
    memo_data = None
    if memo_uuid:
        memo_data = my_memo.get_memo(memo_uuid)
    elif memo_alias:
        memo_data = my_memo.get_memo_by_alias(memo_alias)
    if not memo_data:
        print('Failed to get memo data. memo_uuid: ' + str(memo_uuid) + ' memo_alias: ' + str(memo_alias))
        return memo_data

    return memo_data

def get_memo_data_without_auth_post(event):
    params = json.loads(event['body'] or '{ }')
    if not params or not params.get('params'):
        return False
    
    memo_uuid = params['params'].get('memo_uuid', '')
    memo_alias = params['params'].get('memo_alias', '')
    if not memo_uuid and not memo_alias:
        return False

    # 一旦情報を取得
    memo_data = None
    if memo_uuid:
        memo_data = my_memo.get_memo(memo_uuid)
    elif memo_alias:
        memo_data = my_memo.get_memo_by_alias(memo_alias)
    if not memo_data:
        print('Failed to get memo data. memo_uuid: ' + str(memo_uuid) + ' memo_alias: ' + str(memo_alias))
        return memo_data

    return memo_data

def reset_password(token: str) -> str:
    if not token:
        return False
    
    reset_info = my_memo.get_password_reset_info(token)
    if not reset_info:
        print('Failed to get reset password info. token: ' + token)
        return False
    
    if not my_memo.delete_password_reset_info(token):
        print('Failed to delete reset password info. token:' + token)
        return False
    
    if not my_memo.delete_password(reset_info['uuid']):
        print('Failed to delete password. memo_uuid: ' + reset_info['uuid'])
        return False
    
    return reset_info['uuid']