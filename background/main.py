from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import os

app = FastAPI()

# Allow frontend from anywhere (for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = "data.csv"

# Create CSV header if not exists
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["place_type", "time_of_day", "max_db", "latitude", "longitude"])

class SurveyData(BaseModel):
    place_type: str
    time_of_day: str
    max_db: float
    latitude: float
    longitude: float

@app.post("/submit")
async def submit(data: SurveyData):
    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([data.place_type, data.time_of_day, data.max_db, data.latitude, data.longitude])
    return {"status": "success"}
