import json
import boto3
from botocore.exceptions import ClientError
from email.header import Header # eemail.headerをインポート
from my_common import *

client = boto3.client('ses')

COMPANY_NAME = 'MemoEase'

MY_MAIL = '290Livermorium@gmail.com'
MEMO_EASE_FROM = 'memo-ease@tori-blog.net'

def send_mail(from_view_name, from_mail, to_mail, subject, body):
    try:
        result = client.send_email(
            Source='%s <%s>'%(Header(from_view_name.encode('iso-2022-jp'),'iso-2022-jp').encode(), from_mail),
            Destination = {
                'ToAddresses': [
                    to_mail,
                ]
            },
            Message = {
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': body,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
        return True
    except Exception as e:
        print(e)
        return False
    return False

def send_feedback(to_mail, subject, body):
    return send_mail('MemoEase問い合わせ', MEMO_EASE_FROM, MY_MAIL, subject, body)