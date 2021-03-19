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
from boto3.dynamodb.conditions import Key
from dynamo_utility import *
from my_common import *

db_resource = boto3.resource("dynamodb")
db_client = boto3.client("dynamodb", region_name='ap-northeast-1')

MEMOS_TABLE_NAME = 'memo_ease_memos' + os.environ['DbSuffix']
MEMO_ALIASES_TABLE_NAME = 'memo_ease_memo_aliases' + os.environ['DbSuffix']
memos_table = db_resource.Table(MEMOS_TABLE_NAME)
memo_aliases_table = db_resource.Table(MEMO_ALIASES_TABLE_NAME)

'''
@return {str} 作成したメモのuuid
'''
def create_memo() -> str:
    memo_uuid = str(uuid.uuid4())
    view_id = secrets.token_urlsafe(64)

    # 念の為
    if get_memo(memo_uuid):
        return False
    try:
        newItem = {
                'uuid': memo_uuid,
                'view_id': view_id,
                'is_public': False,
                'password': '',
                'email': '',
                'title': '',
                'updated_at': get_now_string(),
                'created_at': get_now_string(),
                'accessed_at': get_now_string(),
            }
        newAliasItem = {
            'uuid': memo_uuid,
            'alias_name': memo_uuid,
            'created_at': get_now_string(),
        }
        transacts = [
            {
                'Put': {
                    'TableName': MEMOS_TABLE_NAME,
                    'Item': dict2dynamoformat(newItem)
                }
            },
            {
                'Put': {
                    'TableName': MEMO_ALIASES_TABLE_NAME,
                    'Item': dict2dynamoformat(newAliasItem)
                }
            }
        ]

        res = db_client.transact_write_items(
            TransactItems = transacts
        )
        if not res:
            return False
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
    if not memo_uuid:
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
        print(e)
        return False
    return False

def update_password(memo_uuid: str, new_password: str, email: str) -> bool:
    if not memo_uuid:
        return False
    now = get_now_string()

    hash_pass = ''
    if new_password:
        ph = PasswordHasher()
        hash_pass = ph.hash(new_password)

    try:
        res = memos_table.update_item(
            Key = {
                'uuid': memo_uuid,
            },
            UpdateExpression = 'set password=:password, email=:email, updated_at=:updated_at, accessed_at=:accessed_at',
            ExpressionAttributeValues = {
                ':password': hash_pass,
                ':email': email,
                ':accessed_at': now,
                ':updated_at': now,
            },
            ReturnValues="UPDATED_NEW"
        )
        return not not res
    except Exception as e:
        print(e)
        return False
    return False

'''
閲覧用URLを有効状態を変更する

@param str memo_uuid
@return {str}
'''
def change_public_state(memo_uuid: str, is_public: bool) -> str:
    if not memo_uuid:
        return False
    now = get_now_string()

    try:
        res = memos_table.update_item(
            Key = {
                'uuid': memo_uuid,
            },
            UpdateExpression = 'set is_public=:is_public, updated_at=:updated_at, accessed_at=:accessed_at',
            ExpressionAttributeValues = {
                ':is_public': is_public,
                ':accessed_at': now,
                ':updated_at': now,
            },
            ReturnValues="UPDATED_NEW"
        )
        return not not res
    except Exception as e:
        print(e)
        return False
    return False

def record_access(memo_uuid: str) -> bool:
    if not get_memo(memo_uuid):
        return False
    now = get_now_string()
    try:
        res = memos_table.update_item(
            Key = {
                'uuid': memo_uuid,
            },
            UpdateExpression = 'set accessed_at=:accessed_at',
            ExpressionAttributeValues = {
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
        alias_res = memo_aliases_table.query(
            IndexName='uuid-index',
            KeyConditionExpression=Key('uuid').eq(memo_uuid)
        )['Items']
        if not alias_res:
            return None
        
        item = res[0]
        item['alias_name'] = alias_res[0]['alias_name']
        return item
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
        res = memo_aliases_table.query(
            KeyConditionExpression=Key('alias_name').eq(alias_name)
        )['Items']
        if not res:
            return None
        memo_res = memos_table.query(
            KeyConditionExpression=Key('uuid').eq(res[0]['uuid'])
        )['Items']
        if not memo_res:
            return False
        item = memo_res[0]
        item['alias_name'] = res[0]['alias_name']
        return item
    except Exception as e:
        return False
    return False

def change_memo_alias(memo_uuid: str, old_alias: str, new_alias: str):
    if not old_alias or not new_alias:
        return False
    try:
        newAliasItem = {
            'uuid': memo_uuid,
            'alias_name': new_alias,
            'created_at': get_now_string(),
        }
        transacts = [
            {
                'Delete': {
                    'TableName': MEMO_ALIASES_TABLE_NAME,
                    'Key': {
                        'alias_name': to_dynamo_format(old_alias)
                    },
                }
            },
            {
                'Put': {
                    'TableName': MEMO_ALIASES_TABLE_NAME,
                    'Item': dict2dynamoformat(newAliasItem)
                }
            }
        ]
        result = db_client.transact_write_items(
            TransactItems = transacts
        )
        return not not result
    except Exception as e:
        print(e)
        return False
    return False

'''
メモのview_idからメモ情報を取得する. 本体は取らない

@param str view_id
@return dict メモの情報
'''
def get_memo_by_view_id(view_id: str) -> dict:
    if not view_id:
        return None
    try:
        res = memos_table.query(
            IndexName='view_id-index',
            KeyConditionExpression=Key('view_id').eq(view_id)
        )['Items']
        if not res:
            return None
        return res[0]
    except Exception as e:
        return False
    return False