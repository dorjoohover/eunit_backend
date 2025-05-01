import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from category_encoders import TargetEncoder
import joblib
import warnings

# warnings.filterwarnings("ignore")

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

def load_and_preprocess_data_0():
    df = pd.read_excel("Vehicles_ML_last_v_2_2.xlsx")
    columns = [
        "id", "Price", "Brand", "Mark", "Manifactured year", "Imported year",
        "Motor range", "engine", "gearBox", "khurd", "host", "color",
        "interier", "condition", "Distance"
    ]
    df = df[columns]
    df = df.dropna()
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce")

    df = df.dropna()

    keep_columns = ["id", "Price", "Brand", "Mark", "Distance"]
    
    for col in df.columns:
        if col not in keep_columns:
            df[col] = 0

    categorical_cols = ["Brand", "Mark"]
    for col in categorical_cols:
        df[col] = df[col].astype(str)

    df["Distance"] = df["Distance"].astype(str)
    df["Distance_encoded"] = df["Distance"].map(distance_mapping)
    unmapped = df[df["Distance_encoded"].isna()]["Distance"].unique()
    if len(unmapped) > 0:
        print(f"Warning (Model 0): Unmapped Distance categories: {unmapped}. Dropping.")
        df = df.dropna(subset=["Distance_encoded"])
    df["Distance_encoded"] = np.log1p(df["Distance_encoded"])
    df["Price"] = np.log1p(df["Price"])
    q1 = df["Price"].quantile(0.25)
    q3 = df["Price"].quantile(0.75)
    iqr = q3 - q1
    df = df[(df["Price"] >= q1 - 1.5 * iqr) & (df["Price"] <= q3 + 1.5 * iqr)]
    return df

def load_and_preprocess_data_2r():
    df = pd.read_excel("Vehicles_ML_last_v_2_2.xlsx")
    columns = [
        "id", "Price", "Brand", "Mark", "Manifactured year", "Imported year",
        "Motor range", "engine", "gearBox", "khurd", "host", "color",
        "interier", "condition", "Distance"
    ]
    df = df[columns]
    df = df.dropna()
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce")
    df["Manifactured year"] = pd.to_numeric(df["Manifactured year"], errors="coerce")
    df["Imported year"] = pd.to_numeric(df["Imported year"], errors="coerce")
    df = df.dropna()

    invalid_years = df[df["Imported year"] < df["Manifactured year"]]
    if not invalid_years.empty:
        print(
            f"Warning (Model 2r): {len(invalid_years)} rows with Imported year < Manifactured year. Dropping."
        )
        df = df[df["Imported year"] >= df["Manifactured year"]]

    categorical_cols = [
        "Brand", "Mark", "Motor range", "engine", "gearBox",
        "khurd", "host", "color", "interier"
    ]
    for col in categorical_cols:
        df[col] = df[col].astype(str)

    df["Distance"] = df["Distance"].astype(str)
    df["Distance_encoded"] = df["Distance"].map(distance_mapping)
    unmapped = df[df["Distance_encoded"].isna()]["Distance"].unique()
    if len(unmapped) > 0:
        print(f"Warning (Model 2r): Unmapped Distance categories: {unmapped}. Dropping.")
        df = df.dropna(subset=["Distance_encoded"])
    df["Distance_encoded"] = np.log1p(df["Distance_encoded"])

    df["condition"] = df["condition"].astype(str)
    df["condition_encoded"] = df["condition"].map(condition_mapping)
    unmapped_conditions = df[df["condition_encoded"].isna()]["condition"].unique()
    if len(unmapped_conditions) > 0:
        print(
            f"Warning (Model 2r): Unmapped condition categories: {unmapped_conditions}. Setting to 'Дугаар аваагүй'."
        )
        df["condition_encoded"] = df["condition_encoded"].fillna(3)

    df["Age"] = df["Imported year"] - df["Manifactured year"]

    df["Price"] = np.log1p(df["Price"])

    q1 = df["Price"].quantile(0.25)
    q3 = df["Price"].quantile(0.75)
    iqr = q3 - q1
    df = df[(df["Price"] >= q1 - 1.5 * iqr) & (df["Price"] <= q3 + 1.5 * iqr)]

    return df

def train_model_0(df):
    X = df.drop(["id", "Price", "Distance"], axis=1)
    y = df["Price"]
    categorical_cols = ["Brand", "Mark"]
    encoder = TargetEncoder(cols=categorical_cols)
    X_encoded = encoder.fit_transform(X, y)
    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42
    )
    model = RandomForestRegressor(
        n_estimators=100, max_depth=None, min_samples_split=2,
        min_samples_leaf=1, random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"\nModel 0 Performance: MAE = {mae:.2f}, R² = {r2:.2f}")
    feature_importance = pd.DataFrame(
        {"Feature": X_encoded.columns, "Importance": model.feature_importances_}
    ).sort_values(by="Importance", ascending=False)
    print("\nModel 0 Feature Importance:")
    print(feature_importance)
    
    # Save model and encoder to .pkl files
    joblib.dump(model, 'model_0.pkl')
    joblib.dump(encoder, 'encoder_0.pkl')
    
    return model, encoder, X_test, y_test

def train_model_2r(df):
    X = df.drop(["id", "Price", "Distance", "condition"], axis=1)
    y = df["Price"]
    categorical_cols = [
        "Brand", "Mark", "Motor range", "engine", "gearBox",
        "khurd", "host", "color", "interier"
    ]
    encoder = TargetEncoder(cols=categorical_cols)
    X_encoded = encoder.fit_transform(X, y)
    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42
    )
    model = RandomForestRegressor(
        n_estimators=100, max_depth=None, min_samples_split=2,
        min_samples_leaf=1, random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"\nModel 2r Performance: MAE = {mae:.2f}, R² = {r2:.2f}")
    feature_importance = pd.DataFrame(
        {"Feature": X_encoded.columns, "Importance": model.feature_importances_}
    ).sort_values(by="Importance", ascending=False)
    print("\nModel 2r Feature Importance:")
    print(feature_importance)
    
    joblib.dump(model, 'model_2r.pkl')
    joblib.dump(encoder, 'encoder_2r.pkl')
    
    return model, encoder, X_test, y_test

def predict_price_ensemble(model_0, encoder_0, model_2r, encoder_2r, input_data, weight_0=0.3, weight_2r=0.7):
    input_df = pd.DataFrame([input_data])
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

    tree_preds_0 = np.array([tree.predict(input_encoded_0) for tree in model_0.estimators_])
    tree_preds_2r = np.array([tree.predict(input_encoded_2r) for tree in model_2r.estimators_])
    mean_log_0 = np.mean(tree_preds_0, axis=0)[0]
    std_log_0 = np.std(tree_preds_0, axis=0)[0]
    mean_log_2r = np.mean(tree_preds_2r, axis=0)[0]
    std_log_2r = np.std(tree_preds_2r, axis=0)[0]
    ci_lower_0 = np.expm1(mean_log_0 - 1.96 * std_log_0)
    ci_upper_0 = np.expm1(mean_log_0 + 1.96 * std_log_0)
    ci_lower_2r = np.expm1(mean_log_2r - 1.96 * std_log_2r)
    ci_upper_2r = np.expm1(mean_log_2r + 1.96 * std_log_2r)
    ci_lower = weight_0 * ci_lower_0 + weight_2r * ci_lower_2r
    ci_upper = weight_0 * ci_upper_0 + weight_2r * ci_upper_2r

    return ensemble_pred, (ci_lower, ci_upper), pred_0, pred_2r

def evaluate_ensemble(model_0, encoder_0, model_2r, encoder_2r, X_test_0, y_test_0, X_test_2r, y_test_2r, df_0, df_2r):
    common_indices = X_test_0.index.intersection(X_test_2r.index)
    X_test_0 = X_test_0.loc[common_indices]
    y_test_0 = y_test_0.loc[common_indices]
    X_test_2r = X_test_2r.loc[common_indices]
    y_test_2r = y_test_2r.loc[common_indices]

    y_pred_0 = model_0.predict(X_test_0)
    y_pred_2r = model_2r.predict(X_test_2r)
    y_pred_ensemble = 0.3 * y_pred_0 + 0.7 * y_pred_2r

    mae = mean_absolute_error(np.expm1(y_test_0), np.expm1(y_pred_ensemble))
    r2 = r2_score(y_test_0, y_pred_ensemble)

    errors = pd.DataFrame(
        {
            "id": df_0.loc[common_indices, "id"],
            "Actual": np.expm1(y_test_0),
            "Predicted": np.expm1(y_pred_ensemble),
            "Error": abs(np.expm1(y_test_0) - np.expm1(y_pred_ensemble)),
            "Distance": df_0.loc[common_indices, "Distance"],
            "Mark": df_0.loc[common_indices, "Mark"],
        }
    )

if __name__ == "__main__":
    df_0 = load_and_preprocess_data_0()
    df_2r = load_and_preprocess_data_2r()

    model_0, encoder_0, X_test_0, y_test_0 = train_model_0(df_0)
    model_2r, encoder_2r, X_test_2r, y_test_2r = train_model_2r(df_2r)

    evaluate_ensemble(model_0, encoder_0, model_2r, encoder_2r, X_test_0, y_test_0, X_test_2r, y_test_2r, df_0, df_2r)

    example_input = {
        "Brand": "Toyota",
        "Mark": "Land Cruiser 300",
        "Manifactured year": 2024,
        "Imported year": 2025,
        "Motor range": "3.6-4.0",
        "engine": "Бензин",
        "gearBox": "Автомат",
        "khurd": "Зөв",
        "host": "Бүх дугуй 4WD",
        "color": "Цагаан",
        "interier": "Цагаан шар",
        "condition": "Дугаар авсан",
        "Distance": "0-10000",
    }

    try:
        distances = ["0-10000", "10001-20000", "20001-30000", "100001-110000", "300000"]

        for dist in distances:
            example_input["Distance"] = dist
            pred, (ci_lower, ci_upper), pred_0, pred_2r = predict_price_ensemble(
                model_0, encoder_0, model_2r, encoder_2r, example_input
            )

        pred_low, _, pred_0_low, pred_2r_low = predict_price_ensemble(
            model_0, encoder_0, model_2r, encoder_2r, {**example_input, "Distance": "0-10000"}
        )
        pred_high, _, pred_0_high, pred_2r_high = predict_price_ensemble(
            model_0, encoder_0, model_2r, encoder_2r, {**example_input, "Distance": "100001-110000"}
        )

        if pred_low > pred_high:
            print("Logic verified: Lower mileage results in higher price.")
        else:
            print("Logic issue: Higher mileage results in higher price.")

    except ValueError as e:
        print(f"Error: {e}")