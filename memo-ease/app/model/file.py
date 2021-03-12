import json
import boto3
import os
import uuid
import datetime
import time
import secrets
from boto3.dynamodb.conditions import Key
from my_common import *
from dynamo_utility import *

db_resource = boto3.resource("dynamodb")
db_client = boto3.client("dynamodb", region_name='ap-northeast-1')
FILES_TABLE_NAME = 'memo_ease_files' + os.environ['DbSuffix']

files_table = db_resource.Table(FILES_TABLE_NAME)

def add_file(file_key, memo_uuid, file_size, ext):
    try:
        res = files_table.put_item(
            Item = {
                'file_key': file_key,
                'memo_uuid': memo_uuid,
                'ext': ext,
                'created_at': get_now_string(),
                'file_size': file_size,
            }
        )
        return not not res
    except Exception as e:
        print(e)
        return False
    return True