from django.db import models
from django.conf import settings
from mptt.models import MPTTModel, TreeForeignKey

class Tag(models.Model):
    name=models.CharField( max_length=50,unique=True)
    def __str__(self):
        return self.name
    


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, related_name="posts") 
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_votes(self):
        return self.votes.filter(value=1).count() - self.votes.filter(value=-1).count()

    def __str__(self):
        return self.title

class Comment(MPTTModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="children")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class MPTTMeta:
        order_insertion_by = ['created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"
        
class Vote(models.Model):
    VOTE_CHOICES = ((1, 'Upvote'), (-1, 'Downvote'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votes")
    value = models.SmallIntegerField(choices=VOTE_CHOICES)

    class Meta:
        unique_together = ('user', 'post')
