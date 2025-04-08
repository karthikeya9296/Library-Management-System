from mongoengine import Document, StringField

class Admin(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
