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

MEMOS_TABLE_NAME = 'memo_ease_memos' + os.environ['DbSuffix']
memos_table = db_resource.Table(MEMOS_TABLE_NAME)

'''
@return {str} 作成したメモのuuid
'''
def create_memo() -> str:
    memo_uuid = str(uuid.uuid4())
    # 念の為
    if get_memo(memo_uuid):
        return False
    try:
        memos_table.put_item(
            Item = {
                'uuid': memo_uuid,
                'alias_name': '',
                'view_id': '',
                'password': '',
                'title': '',
                'updated_at': get_now_string(),
                'created_at': get_now_string(),
                'accessed_at': get_now_string(),
            }
        )
        return memo_uuid
    except Exception as e:
        print(e)
        return False
    return False

'''
メモの情報を更新する 本文は別でs3に

@param str memo_uuid
@apram title メモのタイトル
@return {bool} 成功すればtrue
'''
def update_memo(memo_uuid: str, title: str) -> bool:
    if not get_memo(memo_uuid):
        return False
    now = get_now_string()
    try:
        res = memos_table.update_item(
            Key = {
                'uuid': memo_uuid,
            },
            UpdateExpression = 'set title=:title, updated_at=:updated_at, accessed_at=:accessed_at',
            ExpressionAttributeValues = {
                ':title': title,
                ':updated_at': now,
                ':accessed_at': now,
            },
            ReturnValues="UPDATED_NEW"
        )
        return not not res
    except Exception as e:
        return False
    return False

'''
メモのuuidからメモ情報を取得する. 本体は取らない

@param str memo_uuid
@return dict メモの情報
'''
def get_memo(memo_uuid: str) -> dict:
    if not memo_uuid:
        return False
    try:
        res = memos_table.query(
            KeyConditionExpression=Key('uuid').eq(memo_uuid)
        )['Items']
        if not res:
            return None
        return res[0]
    except Exception as e:
        return False
    return False

'''
メモのaliasからメモ情報を取得する. 本体は取らない

@param str alias_name
@return dict メモの情報
'''
def get_memo_by_alias(alias_name: str) -> dict:
    if not alias_name:
        return None
    try:
        res = memos_table.query(
            IndexName='alias_name-index',
            KeyConditionExpression=Key('alias_name').eq(alias_name)
        )['Items']
        if not res:
            return None
        return res[0]
    except Exception as e:
        return False
    return False