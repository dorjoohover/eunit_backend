import pandas as pd

# Excel файлыг унших
df = pd.read_excel('car_all.xlsx')

# 1. brand_app: brand-ийн эхний үсгийг том болгох, "-" орлуулсан
df['brand_app'] = df['brand'].str.replace('-', ' ').str.title()

# 2. mark_app: "-" тэмдгийг зайгаар солих, эхний үсгийг том болгох
df['mark_app'] = df['mark'].str.replace('-', ' ').str.title()

# Хасах баганууд
remove_keys = [
    "Engine_capacity", "Year_of_manufacture", "Year_of_entry", "Gearbox",
    "Hurd", "Type", "Color", "Engine", "Interior_color",
    "Leasing", "Drive", "Mileage", "Conditions", "Gate", "price"
]

# Тухайн багана байгаа тохиолдолд л устгана
for key in remove_keys:
    if key in df.columns:
        df.pop(key)

# Давхардсан мөрүүдийг арилгах
df = df.drop_duplicates()

# Индексийг тусдаа багана болгох
df.reset_index(inplace=True)

# JSON файлд хадгалах: бичлэг бүр нь JSON объект
df.to_json('src/app/request/cars/output_with_app_columns.json', orient='records', force_ascii=False, indent=4)

print("JSON файл амжилттай үүслээ: output_with_app_columns.json")
