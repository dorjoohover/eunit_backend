import sys
import json
import pickle
import numpy as np
import pandas as pd

def load_artifacts(pkl_file: str) -> dict:
    with open(pkl_file, "rb") as f:
        return pickle.load(f)

def debug_predict_price(input_data: dict, artifacts: dict) -> float:
    model = artifacts['model']
    label_encoders = artifacts['label_encoders']
    imputer = artifacts['imputer']
    features = artifacts['features']

    input_df = pd.DataFrame([input_data])

    for col in features:
        if input_df[col].dtype == 'object':
            input_df[col] = input_df[col].astype(str)
          
            if col in label_encoders:
                le = label_encoders[col]
                input_df[col] = input_df[col].apply(
                    lambda x: le.transform([x])[0] if x in le.classes_ else np.nan
                )
               
    input_df[features] = imputer.transform(input_df[features])
    
    predicted = model.predict(input_df[features])

    return predicted[0]

def main():
    pkl_file = "src/app/request/cars/car_price_model.pkl"
    artifacts = load_artifacts(pkl_file)

    input_data = json.loads(sys.stdin.read())


    price = debug_predict_price(input_data, artifacts)
    # Эцсийн үр дүнг зөвхөн stdout-д хэвлэнэ
    print(price)

if __name__ == "__main__":
    main()
