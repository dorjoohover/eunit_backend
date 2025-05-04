import sys
import json
import joblib
import numpy as np
import pandas as pd

distance_mapping = {
    "0-10000": 5000,
    "10001-20000": 15000,
    "20001-30000": 25000,
    "30001-40000": 35000,
    "40001-50000": 45000,
    "50001-60000": 55000,
    "60001-70000": 65000,
    "70001-80000": 75000,
    "80001-90000": 85000,
    "90001-100000": 95000,
    "100001-110000": 105000,
    "110001-120000": 115000,
    "120001-130000": 125000,
    "130001-140000": 135000,
    "140001-150000": 145000,
    "150001-160000": 155000,
    "160001-170000": 165000,
    "170001-180000": 175000,
    "180001-190000": 185000,
    "190001-200000": 195000,
    "200001-210000": 205000,
    "210001-220000": 215000,
    "220001-230000": 225000,
    "230001-240000": 235000,
    "240001-250000": 245000,
    "250001-260000": 255000,
    "260001-270000": 265000,
    "270001-280000": 275000,
    "280001-290000": 285000,
    "290001-300000": 295000,
    "300000": 300000,
}

condition_mapping = {
    "00 гүйлттэй": 1,
    "Дугаар авсан": 2,
    "Дугаар аваагүй": 3,
}

def load_artifacts():
    try:
        model_0 = joblib.load("src/app/request/cars/model_0.pkl")
        encoder_0 = joblib.load("src/app/request/cars/encoder_0.pkl")
        model_2r = joblib.load("src/app/request/cars/model_2r.pkl")
        encoder_2r = joblib.load("src/app/request/cars/encoder_2r.pkl")
        return {
            "model_0": model_0,
            "encoder_0": encoder_0,
            "model_2r": model_2r,
            "encoder_2r": encoder_2r
        }
    except Exception as e:
        print(f"Error loading artifacts: {str(e)}", file=sys.stderr)
        sys.exit(1)

def map_mileage_to_distance(mileage):
    for range_str, midpoint in distance_mapping.items():
        if "-" in range_str:
            low, high = map(int, range_str.split("-"))
        else:
            low = high = int(range_str)
        if low <= mileage <= high:
            return range_str
    return "300000"

def map_engine_capacity(engine_capacity):
    if '+' in engine_capacity:
        engine = float(engine_capacity.replace('+', ''))
    elif '-' in engine_capacity:
        engine = float(engine_capacity.split('-')[1])
    else:
        engine = float(engine_capacity)
    if engine <= 2.0:
        return "0-2.0"
    elif engine <= 2.5:
        return "2.1-2.5"
    elif engine <= 3.0:
        return "2.6-3.0"
    elif engine <= 3.5:
        return "3.1-3.5"
    elif engine <= 4.0:
        return "3.6-4.0"
    else:
        return "4.1+"

def predict_price_ensemble(input_data, artifacts, weight_0=0.3, weight_2r=0.7):
    try:
        model_0 = artifacts["model_0"]
        encoder_0 = artifacts["encoder_0"]
        model_2r = artifacts["model_2r"]
        encoder_2r = artifacts["encoder_2r"]

        input_mapped = {
            "Brand": input_data["brand"].title(),
            "Mark": input_data["mark"].replace("-", " ").title(),
            "Manifactured year": input_data["Year_of_manufacture"],
            "Imported year": input_data["Year_of_entry"],
            "Motor range": map_engine_capacity(input_data["Engine_capacity"]),
            "engine": input_data["Engine"],
            "gearBox": input_data["Gearbox"],
            "khurd": input_data["Hurd"],
            "host": input_data["Drive"],
            "color": input_data["Color"],
            "interier": input_data["Interior_color"],
            "condition": input_data["Conditions"],
            "Distance": map_mileage_to_distance(float(input_data["Mileage"]))
        }

        input_df = pd.DataFrame([input_mapped])
        required_cols = [
            "Brand", "Mark", "Manifactured year", "Imported year",
            "Motor range", "engine", "gearBox", "khurd", "host",
            "color", "interier", "condition", "Distance"
        ]
        for col in required_cols:
            if col not in input_df:
                raise ValueError(f"Missing input column: {col}")

        input_df_0 = input_df.copy()
        categorical_cols_0 = ["Brand", "Mark"]
        for col in categorical_cols_0:
            input_df_0[col] = input_df_0[col].astype(str)
        input_df_0["Distance"] = input_df_0["Distance"].astype(str)
        input_df_0["Distance_encoded"] = input_df_0["Distance"].map(distance_mapping)
        if input_df_0["Distance_encoded"].isna().any():
            valid_distances = list(distance_mapping.keys())
            raise ValueError(f"Invalid Distance. Choose from: {valid_distances[:10]} (and more)")
        input_df_0["Distance_encoded"] = np.log1p(input_df_0["Distance_encoded"])
        input_df_0["Manifactured year"] = pd.to_numeric(input_df_0["Manifactured year"], errors="coerce")
        for col in input_df_0.columns:
            if col not in ["Brand", "Mark", "Distance", "Distance_encoded", "Manifactured year"]:
                input_df_0[col] = 0
        input_df_0 = input_df_0.drop(["Distance"], axis=1)
        input_encoded_0 = encoder_0.transform(input_df_0)
        pred_0 = np.expm1(model_0.predict(input_encoded_0)[0])

        input_df_2r = input_df.copy()
        categorical_cols_2r = [
            "Brand", "Mark", "Motor range", "engine", "gearBox",
            "khurd", "host", "color", "interier"
        ]
        for col in categorical_cols_2r:
            input_df_2r[col] = input_df_2r[col].astype(str)
        input_df_2r["Manifactured year"] = pd.to_numeric(input_df_2r["Manifactured year"], errors="coerce")
        input_df_2r["Imported year"] = pd.to_numeric(input_df_2r["Imported year"], errors="coerce")
        input_df_2r["Distance"] = input_df_2r["Distance"].astype(str)
        input_df_2r["Distance_encoded"] = input_df_2r["Distance"].map(distance_mapping)
        if input_df_2r["Distance_encoded"].isna().any():
            valid_distances = list(distance_mapping.keys())
            raise ValueError(f"Invalid Distance. Choose from: {valid_distances[:10]} (and more)")
        input_df_2r["Distance_encoded"] = np.log1p(input_df_2r["Distance_encoded"])
        input_df_2r["condition"] = input_df_2r["condition"].astype(str)
        input_df_2r["condition_encoded"] = input_df_2r["condition"].map(condition_mapping)
        if input_df_2r["condition_encoded"].isna().any():
            input_df_2r["condition_encoded"] = 3
        input_df_2r["Age"] = input_df_2r["Imported year"] - input_df_2r["Manifactured year"]
        if (input_df_2r["Imported year"] < input_df_2r["Manifactured year"]).any():
            raise ValueError("Imported year must be >= Manifactured year")
        input_df_2r = input_df_2r.drop(["Distance", "condition"], axis=1)
        input_encoded_2r = encoder_2r.transform(input_df_2r)
        pred_2r = np.expm1(model_2r.predict(input_encoded_2r)[0])

        ensemble_pred = weight_0 * pred_0 + weight_2r * pred_2r

        return ensemble_pred
    except Exception as e:
        print(f"Error in prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    try:
        artifacts = load_artifacts()
        input_data = json.loads(sys.stdin.read())
        price = predict_price_ensemble(input_data, artifacts)
        print(price)
    except Exception as e:
        print(f"Error in main: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()