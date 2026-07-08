from deepface import DeepFace

print("InSTALLED successfully")

result = DeepFace.verify("Backend\admin.jpg" , "Backend\test.jpg")

print(result)