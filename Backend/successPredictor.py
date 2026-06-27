import pandas as pd
from sklearn.model_selection import train_test_split
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler

MongoDB_uri = "mongodb://localhost:27017/tradex"
client = MongoClient(MongoDB_uri)
db = client['tradex']

trades_collection = db['trades']
order_collection = db['orders']

df_trade = pd.DataFrame(list(trades_collection.find()))

if df_trade.empty:
    print("No data found in the trades collection!")
    exit()
    
df_trade['trade_success'] = (df_trade['realizedPnl']>0).astype(int)

df_trade['openedAt'] = pd.to_datetime(df_trade['openedAt'])
df_trade['entry_hour'] = df_trade['openedAt'].dt.hour
df_trade['entry_day'] = df_trade['openedAt'].dt.dayofweek

df_metrics = pd.json_normalize(df_trade['aiMetrics'].apply(lambda x:x if isinstance(x,dict) else{}))

df_metrics = df_metrics.fillna(0)

df_trade = pd.concat([df_trade,df_metrics],axis=1)

print(df_trade.head())

base_features = ['entryPrice', 'quantity', 'entry_hour', 'entry_day']

metric_features = list(df_metrics.columns)

features_to_use = ['symbol','setupName'] + base_features + metric_features

X_raw = df_trade[features_to_use].copy()
X_raw['setupName'] = X_raw['setupName'].fillna('Unknown')

X = pd.get_dummies(X_raw, columns=['symbol', 'setupName'], dtype=int)
scaler = StandardScaler()
y = df_trade['trade_success']

if len(df_trade) < 5:
    print("\n⚠️ Small dataset detected. Training and testing on the same sample data for verification.")
    X_train, X_test, y_train, y_test = X, X, y, y
else:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
x = scaler.fit_transform(X_train)
model = RandomForestClassifier(n_estimators=100 , random_state=42)

model.fit(X_train,y_train)

predictions = model.predict(scaler.transform(X_test))
probabilities = model.predict_proba(X_test)
trade_1_probs = probabilities[0]
chance_of_failure = trade_1_probs[0] * 100
chance_of_success = trade_1_probs[1] * 100

print(f"Trade 1 Prediction - Success: {chance_of_success:.1f}%, Failure: {chance_of_failure:.1f}%")

importances = model.feature_importances_

features_names = X.columns
importance_df = pd.DataFrame({
    "feature":features_names,
    "importance":importances
})


importance_df = importance_df.sort_values(by="importance",ascending=False)

print("\n--- Why the AI makes its decisions (Most to Least Important) ---")
print(importance_df.head(10))

# accuracy = accuracy_score(y_test,predictions)
# print("\n--- Model Feature Setup ---")
# print(f"Total rows parsed from MongoDB: {len(df_trade)}")
# print(f"Unpacked AI Metric columns: {metric_features}")
# print(f"Final feature vector columns fed to model:\n{list(X.columns)}")
# print(f"Model Accuracy Metric: {accuracy * 100:.2f}%")