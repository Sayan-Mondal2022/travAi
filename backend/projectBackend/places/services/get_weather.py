import requests
from typing import Dict, Any, List
from datetime import date, datetime

class WeatherService:
    def __init__(self, api_key: str):
        self.API_KEY = api_key
        self.BASE_URL = "https://weather.googleapis.com/v1"

    # --------------------------------------------------------
    # SHARED FILTER FUNCTION
    # --------------------------------------------------------
    @staticmethod
    def filter_weather_data(data: Dict[str, Any], mode: str) -> Dict[str, Any]:

        if mode == "current":
            cond = data  # your full JSON object

            return {
                "temperature": cond.get("temperature", {}).get("degrees"),
                "temperatureUnit": cond.get("temperature", {}).get("unit"),
                "humidity": cond.get("relativeHumidity"),
                "windSpeed": cond.get("wind", {}).get("speed", {}).get("value"),
                "windSpeedUnit": cond.get("wind", {}).get("speed", {}).get("unit"),
                "condition": cond.get("weatherCondition", {}).get("description", {}).get("text"),
                "dayOrNight": "day" if cond.get("isDaytime") else "night",
                "precipitationChance": cond.get("precipitation", {}).get("probability", {}).get("percent"),
            }


        elif mode == "forecast":
            days = data.get("forecastDays", [])
            filtered_days: List[Dict[str, Any]] = []

            for day in days:
                disp = day.get("displayDate", {})
                try:
                    dt = date(disp.get("year"), disp.get("month"), disp.get("day"))
                    date_str = dt.isoformat()
                    dayname = dt.strftime("%A")
                except Exception:
                    start_time = day.get("interval", {}).get("startTime")
                    if start_time:
                        try:
                            dtobj = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                            date_str = dtobj.date().isoformat()
                            dayname = dtobj.strftime("%A")
                        except Exception:
                            date_str = start_time
                            dayname = None
                    else:
                        date_str = None
                        dayname = None

                # temps and unit
                max_temp = day.get("maxTemperature", {}).get("degrees")
                min_temp = day.get("minTemperature", {}).get("degrees")
                temp_unit = day.get("maxTemperature", {}).get("unit") or day.get("minTemperature", {}).get("unit")

                # description: prefer daytime, fallback to nighttime
                desc = (
                    day.get("daytimeForecast", {})
                    .get("weatherCondition", {})
                    .get("description", {})
                    .get("text")
                    or day.get("nighttimeForecast", {})
                        .get("weatherCondition", {})
                        .get("description", {})
                        .get("text")
                )

                # precipitation chance: take the maximum of daytime/nighttime if available
                def _precip_percent(forecast_section):
                    return (forecast_section or {}).get("precipitation", {}).get("probability", {}).get("percent")

                p_day = _precip_percent(day.get("daytimeForecast"))
                p_night = _precip_percent(day.get("nighttimeForecast"))
                precip_chance = max([v for v in (p_day, p_night) if v is not None], default=None)

                # humidity: average of daytime/nighttime if both present, else whichever is present
                h_day = day.get("daytimeForecast", {}).get("relativeHumidity")
                h_night = day.get("nighttimeForecast", {}).get("relativeHumidity")
                if h_day is not None and h_night is not None:
                    humidity = int(round((h_day + h_night) / 2))
                else:
                    humidity = h_day if h_day is not None else h_night

                # wind: prefer daytime, fallback to nighttime
                wind_day = day.get("daytimeForecast", {}).get("wind", {}).get("speed", {})
                wind_night = day.get("nighttimeForecast", {}).get("wind", {}).get("speed", {})
                wind_speed = wind_day.get("value") if wind_day.get("value") is not None else wind_night.get("value")
                wind_speed_unit = wind_day.get("unit") if wind_day.get("unit") is not None else wind_night.get("unit")

                filtered_days.append({
                    "date": date_str,
                    "dayname": dayname,
                    "maxTemp": max_temp,
                    "minTemp": min_temp,
                    "temperatureUnit": temp_unit,
                    "description": desc,
                    "precipitationChance": precip_chance,
                    "humidity": humidity,
                    "windSpeed": wind_speed,
                    "windSpeedUnit": wind_speed_unit,
                })

            # data["forecastDays"] -> will give me a list of filtered days
            return {"forecastDays": filtered_days}


        else:
            raise ValueError("Invalid mode passed to filter_weather_data()")

    # --------------------------------------------------------
    # 7-DAY FORECAST FUNCTION
    # --------------------------------------------------------
    def get_forecast_weather(self, latitude: float, longitude: float, days: int = 5):

        if days > 7:
            days = 7

        url = f"{self.BASE_URL}/forecast/days:lookup"

        params = {
            "key": self.API_KEY,
            "location.latitude": latitude,
            "location.longitude": longitude,
            "days": days,
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            raw_data = response.json()

            return WeatherService.filter_weather_data(raw_data, mode="forecast")

        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    # --------------------------------------------------------
    # CURRENT WEATHER FUNCTION
    # --------------------------------------------------------
    def get_current_weather(self, latitude: float, longitude: float):

        url = f"{self.BASE_URL}/currentConditions:lookup"

        params = {
            "key": self.API_KEY,
            "location.latitude": latitude,
            "location.longitude": longitude,
            "unitsSystem": "METRIC",
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            raw_data = response.json()

            return WeatherService.filter_weather_data(raw_data, mode="current")

        except requests.exceptions.RequestException as e:
            return {"error": str(e)}