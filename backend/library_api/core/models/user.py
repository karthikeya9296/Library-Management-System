from mongoengine import Document, StringField, EmailField # Import EmailField for validation

# --- CORRECTED core/models/user.py ---
class User(Document):
    # Define each field only ONCE
    # id is the custom string primary key
    id = StringField(primary_key=True, required=True, unique=True)
    name = StringField(required=True)
    email = EmailField(required=True, unique=True) # Use EmailField for validation
    mobile = StringField(required=True, unique=True)
    address = StringField(required=False) # Address is optional

    # Define the meta class only ONCE
    meta = {
        'collection': 'user',        # Correct collection name
        'auto_create_index': False,  # Disable automatic index creation (Fix for previous error)
        'indexes': [
            # Define secondary indexes here (MongoDB creates _id index automatically)
            # MongoEngine usually infers unique=True from field def, but being explicit is okay
            # {'fields': ['email'], 'unique': True},
            # {'fields': ['mobile'], 'unique': True},
            'email',  # Simpler definition often works
            'mobile', # Simpler definition often works
            'name',   # Index for searching/sorting by name
        ]
    }

    # Define __str__ only ONCE
    def __str__(self):
        return f"{self.name} ({self.id})"

# --- The redundant code below this line should be DELETED ---
# (You had copies of the id field, meta class, and other fields here)