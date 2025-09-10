from ninja import NinjaAPI, Schema

from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI
from ninja_jwt.authentication import JWTAuth

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

class UserSchema(Schema):
    username: str
    is_authenticated: bool

@api.get("/hello")
def hello(request):
    print(request)
    return {"message" : "Hello World!!"}

@api.get("/me", response=UserSchema, auth=JWTAuth())
def me(request):
    return request.user