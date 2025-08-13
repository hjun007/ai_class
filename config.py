# -*- coding: utf-8 -*-
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    JSON_AS_ASCII = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    DEBUG = True
    HOST = '127.0.0.1'
    PORT = 5000

    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'ai_class.db')

    API_KEY = "sk-01b3458b2c3c4e04b962d75c08353c12"
    BASE_URL = "https://api.deepseek.com/v1"
