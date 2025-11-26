from django.contrib import admin
from django.urls import path, include
from ninja import NinjaAPI
from places.views import tour_router
from places.routers.distance import routes_router
from places.routers.trip_data import trip_router

api = NinjaAPI()
api.add_router("/trip", trip_router)
api.add_router("/tour", tour_router)
api.add_router("/routes", routes_router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
