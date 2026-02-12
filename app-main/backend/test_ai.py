import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: No API Key found in .env")
else:
    print(f"✅ Key found: {api_key[:10]}...")
    
    # Configure the library
    genai.configure(api_key=api_key)

    print("\n🔍 Asking Google for available models...")
    try:
        found_any = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   - {m.name}")
                found_any = True
        
        if not found_any:
            print("⚠️ Connected, but no text-generation models found.")
    except Exception as e:
        print(f"❌ Error connecting to Google: {e}")