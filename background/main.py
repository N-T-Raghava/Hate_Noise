from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import csv
import os

app = FastAPI()

# Allow frontend (Vercel) to talk to backend (Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use the actual Vercel domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = "data.csv"

# Create CSV header if file doesn't exist
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["place_type", "time_of_day", "latitude", "longitude", "decibel_level"])

@app.post("/submit")
async def submit(request: Request):
    data = await request.json()
    print("Received data:", data)

    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            data.get("place_type"),
            data.get("time_of_day"),
            data.get("latitude"),
            data.get("longitude"),
            data.get("decibel_level"),
        ])
    return {"message": "Data saved successfully"}
