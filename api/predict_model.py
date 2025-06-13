import sys
import json
import joblib
import pandas as pd

# Load model and encoder
model = joblib.load('ensemble_clf.pkl')
encoder = joblib.load('label_encoder.pkl')

# Explanation of disorders (dictionary)
penjelasan_disorder_int = {
    0: {'Deskripsi': "Gangguan ADHD ditandai dengan kesulitan fokus dan hiperaktivitas.",
        'Tips': "Gunakan to-do list harian, hindari distraksi, dan pertimbangkan terapi perilaku."},
    1: {'Deskripsi': "Autism Spectrum Disorder memengaruhi kemampuan komunikasi dan interaksi sosial.",
        'Tips': "Gunakan pendekatan visual, sediakan rutinitas yang stabil, dan konsultasikan ke ahli tumbuh kembang."},
    2: {'Deskripsi': "Kesepian adalah perasaan kurang memiliki koneksi sosial yang bermakna.",
        'Tips': "Bangun koneksi baru lewat komunitas, relawan, atau hobi yang disukai."},
    3: {'Deskripsi': "Major Depressive Disorder adalah depresi berat yang mengganggu aktivitas harian.",
        'Tips': "Lakukan aktivitas kecil secara rutin, jaga pola tidur, dan jangan ragu mencari bantuan profesional."},
    4: {'Deskripsi': "Tidak ditemukan indikasi gangguan mental dari input yang diberikan.",
        'Tips': "Tetap jaga kesehatan mental dengan gaya hidup sehat, cukup tidur, dan aktivitas positif."},
    5: {'Deskripsi': "Obsessive Compulsive Disorder menyebabkan obsesi pikiran dan tindakan berulang.",
        'Tips': "Kenali pola kompulsif, lakukan teknik distraksi, dan pertimbangkan terapi CBT."},
    6: {'Deskripsi': "PDD adalah depresi ringan tapi berlangsung kronis selama bertahun-tahun.",
        'Tips': "Bangun kebiasaan sehat, pertahankan rutinitas harian, dan konsultasikan secara berkala."},
    7: {'Deskripsi': "PTSD muncul setelah pengalaman traumatis berat.",
        'Tips': "Gunakan teknik grounding, hindari pemicu, dan pertimbangkan terapi trauma."},
    8: {'Deskripsi': "Gangguan kecemasan ditandai dengan kekhawatiran berlebih dan gejala fisik seperti jantung berdebar.",
        'Tips': "Latih pernapasan dalam, kurangi kafein, dan konsultasikan jika terus berlanjut."},
    9: {'Deskripsi': "Bipolar ditandai dengan perubahan mood ekstrem antara depresi dan mania.",
        'Tips': "Pantau suasana hati dengan jurnal, tidur cukup, dan ikuti pengobatan yang teratur."},
    10: {'Deskripsi': "Gangguan makan menyebabkan pola makan tidak sehat dan gangguan citra tubuh.",
         'Tips': "Fokus pada pemulihan, hindari pembanding sosial, dan cari dukungan profesional."},
    11: {'Deskripsi': "Depresi psikotik adalah depresi berat disertai halusinasi atau delusi.",
         'Tips': "Segera konsultasi ke psikiater dan pastikan pemantauan medis secara ketat."},
    12: {'Deskripsi': "Gangguan tidur mengganggu kualitas dan kuantitas istirahat yang sehat.",
         'Tips': "Ciptakan rutinitas tidur, hindari layar sebelum tidur, dan evaluasi pola tidur harian."}
}

# List of input features
fitur_input = [
    'age', 'panic', 'sweating', 'concentration_trouble', 'work_trouble',
    'hopelessness', 'anger', 'over_react', 'eating_change', 'suicidal_thought',
    'tired', 'weight_gain', 'introvert', 'nightmares', 'avoids_people_activities',
    'negative_feeling', 'self_blaming', 'hallucinations', 'repetitive_behaviour',
    'increased_energy'
]

# Read the input data from the command-line argument
input_data = sys.argv[1]
data = json.loads(input_data)

# Validate the data (ensure it has all necessary features)
missing_features = [f for f in fitur_input if f not in data]
if missing_features:
    raise ValueError(f"Data missing features: {', '.join(missing_features)}")

# Convert input data into a DataFrame
df_input = pd.DataFrame([data], columns=fitur_input)

# Make the prediction
pred_num = model.predict(df_input)[0]
pred_label = encoder.inverse_transform([pred_num])[0]
confidence = model.predict_proba(df_input)[0][pred_num] * 100
detail = penjelasan_disorder_int.get(pred_num, {'Deskripsi': '-', 'Tips': '-'})

# Prepare the result
result = {
    'label': pred_label,
    'confidence_percent': round(confidence, 2),
    'description': detail['Deskripsi'],
    'tips': detail['Tips']
}

# Return the result to Node.js
print(json.dumps(result))
