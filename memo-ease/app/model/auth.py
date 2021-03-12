import json
import boto3
import os
import uuid
import datetime
import time
import secrets
import concurrent.futures
from enum import Enum
from boto3.dynamodb.conditions import Key
from dynamo_utility import *
from my_common import *

db_resource = boto3.resource("dynamodb")
db_client = boto3.client("dynamodb", region_name='ap-northeast-1')

CREATE_HISTORIES_TABLE_NAME = 'memo_ease_create_histories' + os.environ['DbSuffix']
create_histories_table = db_resource.Table(CREATE_HISTORIES_TABLE_NAME)

EXPIRATION_RESET_PASS = 60 * 5 # 5分
EXPIRATION_TIME_PERIOD = 3600 * 24 * 30 # 30日
EXPIRATION_LOGIN_HISTORY = 3600 * 24 * 90 # 90日
LOGIN_TIME_RANGE = 60 * 5

MAX_CREATE_TRY_COUNT = 10

'''
メモ作成したことを記録

@param str ip_address IPアドレス
@return {bool} 記録成功かどうか
'''
def add_create_history(ip_address: str) -> bool:
    if not ip_address:
        return False
    
    try:
        res = create_histories_table.put_item(
            Item = {
                'ip_address': ip_address,
                'created_at': get_now_string(),
                'expiration_time': int(time.time()) + EXPIRATION_TIME_PERIOD
            }
        )
        return not not res
    except Exception as e:
        print(e)
        return False
    return False

'''
メモが作成できるかをチェック

@param ip_address IPアドレス
@return {bool} 作成できるならtrue
'''
def check_create_history(ip_address: str) -> bool:
    now = get_now_string()
    from_time = get_calced_from_now_string(LOGIN_TIME_RANGE)

    try:
        result = create_histories_table.query(
            KeyConditionExpression=Key('ip_address').eq(ip_address),
            FilterExpression='created_at > :created_at',
            ExpressionAttributeValues={
                ':created_at': from_time
            }
        )
        # レコード数が多ければログイン試行が多いので拒否
        if len(result['Items']) > MAX_CREATE_TRY_COUNT:
            return False
        print(len(result['Items']))
        return True
    except Exception as e:
        print(e)
        return False
    return False