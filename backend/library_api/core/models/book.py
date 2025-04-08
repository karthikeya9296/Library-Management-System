from mongoengine import Document, StringField, IntField

# --- Example for core/models/book.py ---
class Book(Document):
    id = StringField(primary_key=True, required=True, unique=True)
    b_name = StringField(required=True)
    author = StringField(required=False)
    genre= StringField(required=False)
    stock = IntField(default=0, required=True)

    meta = {
        'collection': 'book',
        'auto_create_index': False, # <--- MAKE SURE THIS IS PRESENT AND False
        'indexes': [
            'b_name',
            'author',
            'genre',
        ]
    }
    id = StringField(primary_key=True, required=True, unique=True)
    # ... other fields ...

    meta = {
        'collection': 'book',
        'auto_create_index': False, # <--- Add this line
        'indexes': [
            'b_name',
            'author',
            'genre',
        ]
    }
    # Make the custom string 'id' the primary key
    id = StringField(primary_key=True, required=True, unique=True)
    b_name = StringField(required=True)
    author = StringField(required=False) # Optional
    genre= StringField(required=False) # Optional
    stock = IntField(default=0, required=True)

    meta = {
        'collection': 'book', # Explicitly set collection name
        'indexes': [
            'b_name',
            'author',
            'genre',
        ]
    }

    def __str__(self):
         return f"{self.b_name} by {self.author} ({self.id})"