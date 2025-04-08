
from mongoengine import Document, StringField # Remove ReferenceField, DateTimeField

# No need to import User/Book here if not using ReferenceField

# --- Example for core/models/record.py ---
class Record(Document):
    user_id = StringField(required=True)
    book_id = StringField(required=True)
    fine = StringField(null=True)
    issued_on = StringField(required=True) # Keeping as string per last change
    due_date = StringField(required=True)   # Keeping as string
    returned_on = StringField(null=True) # Keeping as string
    status = StringField(choices=["0", "1"], default="0", required=True)

    meta = {
        'collection': 'record',
        'auto_create_index': False, # <--- MAKE SURE THIS IS PRESENT AND False
        'indexes': [
             # MongoDB automatically indexes _id. No need to define.
             'user_id',
             'book_id',
             'status',
             'due_date',
        ]
    }
    # user_id and book_id store the *custom string ID* from User/Book collections
    user_id = StringField(required=True)
    book_id = StringField(required=True)

    # Keep date fields as StringField to match current database structure
    # Add validation logic in the serializer/view if strict format needed
    fine = StringField(null=True) # Allow null
    issued_on = StringField(required=True)
    due_date = StringField(required=True)
    returned_on = StringField(null=True) # Allow null

    # Status field matches database
    status = StringField(choices=["0", "1"], default="0", required=True)

    meta = {
        'collection': 'record', # Explicitly set collection name
        'indexes': [
            'user_id',
            'book_id',
            'status',
            'due_date', # Index if querying overdue books often
        ]
    }

    def __str__(self):
        return f"Record: User({self.user_id}) -> Book({self.book_id}) (Status: {self.status})"