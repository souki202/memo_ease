import json
import boto3
from botocore.exceptions import ClientError
from email.header import Header # eemail.headerをインポート
from my_common import *

client = boto3.client('ses')

COMPANY_NAME = 'MemoEase'

MY_MAIL = '290Livermorium@gmail.com'

reset_password_mail_body = '''
パスワードリセット用のURLを発行しました。
下記URLクリックでパスワードがリセットされます。

[[[reset_password_url]]]

本メールに心当たりのない方は、お手数ではございますが、このままこのメールを削除してください。

'''

MAIL_FOOTER = '''
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
発行元 MemoEase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
'''

def create_reset_password_url(reset_token):
    return get_page_url() + '/reset_password.html?token=' + reset_token

def send_text_mail(from_view_name, from_mail, to_mail, subject, body):
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
    return send_text_mail('MemoEase問い合わせ', get_support_from(), MY_MAIL, subject, body)

def send_reset_password_mail(to_mail, reset_token):
    body = reset_password_mail_body + MAIL_FOOTER
    body = body.replace('[[[reset_password_url]]]', create_reset_password_url(reset_token))
    return send_text_mail('noreply', get_noreply_from(), to_mail, 'MemoEase パスワードリセット', body)

def get_noreply_from():
    return 'noreply@memo-ease.com'

def get_support_from():
    return 'support@memo-ease.com'