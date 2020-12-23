from django.contrib import admin
from .models import User, Email


class AdminEmail(admin.ModelAdmin):
    list_display = ('sender', 'subject', 'read', 'archived', 'timestamp')

# Register your models here.
admin.site.register(User)
admin.site.register(Email, AdminEmail)