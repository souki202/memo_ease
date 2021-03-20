import json
import boto3
import os
import uuid
import datetime
import time
from my_common import *
from common_headers import *
import service.mail as my_mail

def feedback_event(event, context):
    params = json.loads(event['body'] or '{ }')
    if not params or not params.get('params'):
        return create_common_return_array(406, {'message': "Not enough input.",})

    title = params['params'].get('title')
    user_mail = params['params'].get('email')
    body = params['params'].get('body')
    token = params['params'].get('token')

    if not token or not body:
        return create_common_return_array(406, {'message': "Not enough input.",})

    # 自分宛てにメールを送信
    body = '返信先: ' + user_mail + "\n" + body

    if not my_mail.send_feedback(user_mail, title, body):
        print('フィードバック送信に失敗. mail: ' + user_mail + ' title: ' + title)
        return create_common_return_array(500, {'message': "Failed to send mail.",})
    
    return create_common_return_array(200, {})
