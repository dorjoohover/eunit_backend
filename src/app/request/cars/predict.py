import sys
import json
import joblib
import numpy as np
import pandas as pd
import logging
import os

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

condition_mapping = {
    "00 гүйлттэй": 1,
    "Дугаар авсан": 2,
    "Дугаар аваагүй": 3,
}


def load_median_data():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        median_path = os.path.join(base_dir, "median_data.xlsx")
        median_df = pd.read_excel(median_path)

        mileage_to_price_change = dict(
            zip(
                median_df["Км-ийн өсөлт"].astype(str),
                median_df["Үнийн өөрчлөлтийн хувь"],
            )
        )

        if "300000" not in mileage_to_price_change:
            mileage_to_price_change["300000"] = (
                median_df["Үнийн өөрчлөлтийн хувь"].iloc[-1]
                if not median_df.empty
                else -0.045
            )

        logger.info("Loaded median_data.xlsx successfully")
        return mileage_to_price_change
    except FileNotFoundError:
        logger.error("median_data.xlsx not found")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error loading median_data.xlsx: {str(e)}")
        sys.exit(1)

def load_model():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "model.pkl")
        model = joblib.load(model_path)
        logger.info("Loaded model.pkl successfully")
        return model
    except Exception as e:
        logger.error(f"Error loading model.pkl: {str(e)}")
        sys.exit(1)


def load_price_bins():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "Vehicles_ML_last_v_2_5.xlsx")
        df = pd.read_excel(file_path)

        df["Price"] = pd.to_numeric(df["Price"], errors="coerce")
        df = df.dropna(subset=["Price"])

        mileage_to_price_change = load_median_data()

        def map_distance_to_median_range(dist):
            if dist == "300000":
                return "300000"
            try:
                low, high = (
                    map(int, dist.split("-")) if "-" in dist else (int(dist), int(dist))
                )
                for median_range in mileage_to_price_change.keys():
                    if median_range == "300000" and dist == "300000":
                        return median_range
                    if "-" in median_range:
                        m_low, m_high = map(int, median_range.split("-"))
                        if low >= m_low and high <= m_high:
                            return median_range
                return "0-5000"
            except (ValueError, TypeError):
                return "0-5000"

        df["Distance_mapped"] = df["Distance"].apply(map_distance_to_median_range)

        df["Price_adjusted"] = df.apply(
            lambda row: row["Price"]
            * (1 + mileage_to_price_change.get(row["Distance_mapped"], 0)),
            axis=1,
        )

        price_bins = df["Price_adjusted"].quantile([0, 0.25, 0.5, 0.75, 1]).values
        logger.info("Loaded price bins from Vehicles_ML_last_v_2_5.xlsx")

        return price_bins

    except Exception as e:
        logger.error(f"Error loading price bins: {str(e)}")
        sys.exit(1)

def parse_distance(dist):
    try:
        if isinstance(dist, (int, float)):
            return float(dist)
        if dist == "300000":
            return 300000
        elif "-" in dist:
            low, high = map(int, dist.split("-"))
            return (low + high) / 2
        return float(dist)
    except (ValueError, TypeError):
        logger.warning(f"Invalid Distance format: {dist}. Setting to 0")
        return 0


def map_distance_to_median_range(dist, mileage_to_price_change):
    valid_ranges = mileage_to_price_change.keys()
    dist_str = str(dist)
    if dist_str in valid_ranges:
        return dist_str
    try:
        if "-" in dist_str:
            low, high = map(int, dist_str.split("-"))
            for median_range in valid_ranges:
                if median_range == "300000" and dist_str == "300000":
                    return median_range
                if "-" in median_range:
                    m_low, m_high = map(int, median_range.split("-"))
                    if low >= m_low and high <= m_high:
                        return median_range
        elif dist_str == "300000":
            return "300000"
        elif float(dist_str).is_integer():
            dist_num = float(dist_str)
            for median_range in valid_ranges:
                if median_range == "300000" and dist_num >= 300000:
                    return "300000"
                if "-" in median_range:
                    m_low, m_high = map(int, median_range.split("-"))
                    if m_low <= dist_num <= m_high:
                        return median_range
        logger.warning(f"Invalid Distance range: {dist}. Setting to '0-5000'")
        return "0-5000"
    except (ValueError, TypeError):
        logger.warning(f"Invalid Distance format: {dist}. Setting to '0-5000'")
        return "0-5000"


def parse_motor_range(motor):
    try:
        if "-" in motor:
            return float(motor.split("-")[0])
        elif motor == "Цахилгаан":
            return 0.0
        return float(motor)
    except ValueError:
        logger.warning(f"Invalid Motor range: {motor}")
        return 0.0


def predict_price(input_data, model, mileage_to_price_change, price_bins):
    try:
        input_mapped = {
            "Brand": input_data["brand"],
            "Mark": input_data["mark"],
            "Manifactured year": input_data["Year_of_manufacture"],
            "Imported year": input_data["Year_of_entry"],
            "Motor range": input_data["Engine_capacity"],
            "engine": input_data["Engine"],
            "gearBox": input_data["Gearbox"],
            "khurd": input_data["Hurd"],
            "host": input_data["Drive"],
            "color": input_data["Color"],
            "interier": input_data["Interior_color"],
            "condition": input_data["Conditions"],
            "Distance": input_data["Mileage"],
        }

        input_df = pd.DataFrame([input_mapped])
        required_cols = [
            "Brand",
            "Mark",
            "Manifactured year",
            "Imported year",
            "Motor range",
            "engine",
            "gearBox",
            "khurd",
            "host",
            "color",
            "interier",
            "condition",
            "Distance",
        ]
        for col in required_cols:
            if col not in input_df:
                raise ValueError(f"Missing input column: {col}")

        categorical_cols = [
            "Brand",
            "Mark",
            "Motor range",
            "engine",
            "gearBox",
            "khurd",
            "host",
            "color",
            "interier",
        ]
        for col in categorical_cols:
            input_df[col] = input_df[col].astype(str)

        input_df["Manifactured year"] = pd.to_numeric(
            input_df["Manifactured year"], errors="coerce"
        )
        input_df["Imported year"] = pd.to_numeric(
            input_df["Imported year"], errors="coerce"
        )
        if input_df[["Manifactured year", "Imported year"]].isna().any().any():
            raise ValueError(
                "Invalid Manifactured year or Imported year. Must be numeric."
            )

        input_df["Distance_encoded"] = input_df["Distance"].apply(parse_distance)
        input_df["Distance_mapped"] = input_df["Distance"].apply(
            lambda x: map_distance_to_median_range(x, mileage_to_price_change)
        )

        input_df["condition"] = input_df["condition"].astype(str)
        input_df["condition_encoded"] = (
            input_df["condition"].map(condition_mapping).fillna(3)
        )

        input_df["Age"] = input_df["Imported year"] - input_df["Manifactured year"]
        if (input_df["Imported year"] < input_df["Manifactured year"]).any():
            raise ValueError("Imported year must be >= Manifactured year")

        input_df["Distance_Age_Interaction"] = (
            input_df["Distance_encoded"] * input_df["Age"]
        )
        input_df["Distance_Motor_Interaction"] = input_df[
            "Distance_encoded"
        ] * input_df["Motor range"].map(parse_motor_range)

        input_df = input_df.drop(["Distance", "condition", "Distance_mapped"], axis=1)

        pred_price = model.predict(input_df)[0]

        distance_mapped = map_distance_to_median_range(
            input_mapped["Distance"], mileage_to_price_change
        )
        pred_price_adjusted = pred_price * (
            1 + mileage_to_price_change.get(distance_mapped, 0)
        )

        if pred_price_adjusted <= price_bins[1]:
            pred_range = "Low"
        elif pred_price_adjusted <= price_bins[2]:
            pred_range = "Medium"
        elif pred_price_adjusted <= price_bins[3]:
            pred_range = "High"
        else:
            pred_range = "Very High"

        # Placeholder for probabilities and confidence intervals
        prob = np.array([0.25] * 4)  # Default equal probabilities
        ci_lower = np.clip(prob - 1.96 * np.std(prob), 0, 1)
        ci_upper = np.clip(prob + 1.96 * np.std(prob), 0, 1)

        return {
            "predicted_price": float(pred_price_adjusted),
        }
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise


def main():
    try:
        model = load_model()
        mileage_to_price_change = load_median_data()
        price_bins = load_price_bins()
        input_data = json.loads(sys.stdin.read())

        if isinstance(input_data, list):
            results = []
            for data in input_data:
                result = predict_price(data, model, mileage_to_price_change, price_bins)
                
                results.append(result)
        else:
            results = predict_price(
                input_data, model, mileage_to_price_change, price_bins
            )
        print(json.dumps(results, ensure_ascii=False))
        return results
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON input: {str(e)}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
