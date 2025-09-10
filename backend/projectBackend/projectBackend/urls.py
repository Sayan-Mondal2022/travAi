from django.contrib import admin
from django.urls import path, include
from ninja import NinjaAPI
from places.views import trip_router, tour_router

api = NinjaAPI()
api.add_router("/trip", trip_router)
api.add_router("/tour", tour_router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
