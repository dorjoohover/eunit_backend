import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def load_data(file_path: str) -> pd.DataFrame:

    try:
        df = pd.read_excel(file_path, engine="openpyxl")
    except Exception as e:
        try:
            df = pd.read_excel(file_path, engine="xlrd")
        except Exception as e:
            print(f"Error reading Excel file: {e}")
            df = pd.DataFrame()
            print("Continuing with an empty DataFrame. Check file path.")
    return df

def preprocess_data(df: pd.DataFrame, features: list, target: str):

    data = df[features + [target]].copy()
    data = data.dropna(subset=[target])  

    label_encoders = {}
    for col in features:
        if data[col].dtype == 'object':
            data[col] = data[col].astype(str)
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col])
            label_encoders[col] = le

    data.replace([np.inf, -np.inf], np.nan, inplace=True)
    imputer = SimpleImputer(strategy='mean')
    data[features] = imputer.fit_transform(data[features])
 
    X = data[features]
    y = data[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test, label_encoders, imputer


def hyperparameter_tuning(X_train, y_train, cv=5):

    "Гиперпараметрийн тохиргооны шилдэг параметрүүд: {'max_depth': None, 'min_samples_leaf': 1, 'min_samples_split': 10, 'n_estimators': 150}"
    # param_grid = {
    #     'n_estimators': [50, 100, 150, 200],
    #     'max_depth': [None, 10, 20, 30],
    #     'min_samples_split': [2, 5, 10],
    #     'min_samples_leaf': [1, 2, 4]
    # }
    param_grid = {
        'n_estimators': [150],
        'max_depth': [None],
        'min_samples_split': [10],
        'min_samples_leaf': [1]
    }
    
    etr = ExtraTreesRegressor(random_state=42)
    grid_search = GridSearchCV(estimator=etr, param_grid=param_grid, cv=cv, n_jobs=-1,
                           scoring='neg_mean_squared_error', verbose=3)
    grid_search.fit(X_train, y_train)
    best_params = grid_search.best_params_
    best_score = np.sqrt(-grid_search.best_score_)
    print("Гиперпараметрийн тохиргооны шилдэг параметрүүд:", best_params)
    print(f"CV RMSE: {best_score:.2f}")
    best_model = grid_search.best_estimator_
    return best_model

def evaluate_model(model, X_test, y_test):

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Үнэлгээ - MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
    return {"MAE": mae, "RMSE": rmse, "R2": r2}


def predict_price(input_data: dict, features: list, label_encoders: dict, imputer: SimpleImputer, model) -> float:

    input_df = pd.DataFrame([input_data])

    for col in features:
        if input_df[col].dtype == 'object':
            input_df[col] = input_df[col].astype(str)
            if col in label_encoders:
                le = label_encoders[col]
                input_df[col] = input_df[col].apply(lambda x: le.transform([x])[0] if x in le.classes_ else np.nan)
  
    input_df[features] = imputer.transform(input_df[features])
    predicted_price = model.predict(input_df[features])
    return predicted_price[0]




def save_model(artifacts: dict, filename: str = "model.pkl"):

    with open(filename, "wb") as f:
        pickle.dump(artifacts, f)
    print(f"Модель болон холбогдох объектууд {filename} файлд хадгалагдлаа.")


def main():

    file_path = "srs/app/request/cars/car_all.xlsx"
    features = ['brand', 'mark', 'Engine_capacity', 'Year_of_manufacture', 'Year_of_entry',
                'Gearbox', 'Hurd', 'Type', 'Color', 'Engine', 'Interior_color',
                'Drive', 'Mileage', 'Conditions']
    target = 'price'
    df = load_data(file_path)
    print("Анхны өгөгдлийн зарим мөр:")
    print(df.head(), "\n")
    print("Өгөгдлийн мэдээлэл:")
    print(df.info())
    print("Хоосон утгуудын тоо:")
    print(df.isnull().sum(), "\n")
 
    X_train, X_test, y_train, y_test, label_encoders, imputer = preprocess_data(df, features, target)

    hyper_tuning = True
    if hyper_tuning:
        model = hyperparameter_tuning(X_train, y_train, cv=5)
    else:
        model = ExtraTreesRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

    metrics = evaluate_model(model, X_test, y_test)

    print("Онцлогын чухал байдлыг дүрслэх:")
    X_train_df = pd.DataFrame(X_train, columns=features)


    # pickle файл (pkl) болгон хадгалах
    artifacts = {
        'model': model,
        'label_encoders': label_encoders,
        'imputer': imputer,
        'features': features,
        'target': target
    }
    save_model(artifacts, filename="car_price_model.pkl")

if __name__ == "__main__":
    main()
