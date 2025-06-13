import sys
import json
import os
import warnings
from contextlib import redirect_stdout, redirect_stderr
from io import StringIO

# Completely suppress TensorFlow output
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore')

# Import with output suppression
with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
    from tensorflow.keras.models import load_model
    from PIL import Image
    import numpy as np

# Set UTF-8 encoding for Windows
if sys.platform.startswith('win'):
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    except:
        pass

# Labels dictionary
labels_dict = {
    0: 'Angry', 1: 'Disgust', 2: 'Fear',
    3: 'Happy', 4: 'Neutral', 5: 'Sad', 6: 'Surprise'
}

def main():
    try:
        # Get image path from command line arguments
        if len(sys.argv) < 2:
            raise ValueError("No image path provided")
        
        image_path = sys.argv[1]
        
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Load model with output suppression
        MODEL_PATH = 'Model/ResNet50V2_Model.h5'
        with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            model = load_model(MODEL_PATH)
        
        # Process image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.asarray(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction with complete output suppression
        with redirect_stdout(StringIO()), redirect_stderr(StringIO()):
            prediction = model.predict(img_array, verbose=0)
        
        # Get results
        label_index = np.argmax(prediction)
        mood = labels_dict[label_index]
        confidence = float(np.max(prediction))
        
        # Create result
        result = {
            'prediction': mood,
            'confidence': confidence
        }
        
        # Output ONLY the JSON result
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            'error': f"Error processing the image: {str(e)}"
        }
        print(json.dumps(error_result, ensure_ascii=False))

if __name__ == "__main__":
    main()