#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Arduino_JSON.h>

const char* ssid = "Testrb";
const char* password = "12345678s";

//Your IP address or domain name with URL path
//const char* serverName = "https://example.com/esp-outputs-action.php?action=outputs_state&board=1";
const char* serverName = "https://learningproject2023.000webhostapp.com/esp-outputs-action.php?action=outputs_state&board=1";
// Update interval time set to 5 seconds
const long interval = 5000;
unsigned long previousMillis = 0;

String outputsState;
OneWire oneWire(17);
DallasTemperature ds(&oneWire);

// humidite
String inputA3Value ="0";
// temperature
String input17Value ="0";

void setup() {
  Serial.begin(115200);
 
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  ds.begin();
  pinMode(10, OUTPUT);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillis >= interval) {
        // Check WiFi connection status
        if(WiFi.status()== WL_CONNECTED )
        {
            outputsState = httpGETRequest(serverName);
            //Serial.println(outputsState);
            JSONVar myObject = JSON.parse(outputsState);

            // JSON.typeof(jsonVar) can be used to get the type of the var
            if (JSON.typeof(myObject) == "undefined") {
                Serial.println("Parsing input failed!");
                return;
            }

            Serial.print("JSON object = ");
            delay(5);
            Serial.println(myObject);
            delay(5);
            // myObject.keys() can be used to get an array of all the keys in the object
            JSONVar keys = myObject.keys();

            for (int i = 0; i < keys.length(); i++)
            {
                JSONVar value = myObject[keys[i]];
                Serial.print("GPIO: ");
                delay(5);
                Serial.print(keys[i]);
                Serial.print(" - SET to: ");
                Serial.println(value);
                delay(5);
                pinMode(atoi(keys[i]), OUTPUT);
                digitalWrite(atoi(keys[i]), atoi(value));
            }

            int humidite = analogRead(A3);
            inputA3Value = String(humidite);
            Serial.print("humidite =");
            Serial.println(inputA3Value);
            //lecture temperature
            ds.requestTemperatures();
            int temperature = ds.getTempCByIndex(0);
            input17Value = String(temperature);
            Serial.print("temperature =");
            Serial.println(input17Value);
            String sendTempHum = "https://lightning-garden.onrender.com/update?temp="+input17Value+"&hum="+inputA3Value;
            httpGETRequest(sendTempHum);

            Serial.println("FIN BOUCLE");
            // save the last HTTP GET Request
            previousMillis = currentMillis;
        }
        else {
            Serial.println("WiFi Disconnected");
        }
    }
}

String httpGETRequest(const char* serverName) {
  WiFiClientSecure *client = new WiFiClientSecure;
 
  // set secure client without certificate
  client->setInsecure();
  HTTPClient https;
   
  // Your IP address with path or Domain name with URL path
  https.begin(*client, serverName);
 
  // Send HTTP POST request
  int httpResponseCode = https.GET();
 
  //String payload = "{}";
  String payload = "";
 
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
   
    Serial.println(httpResponseCode);
     payload = https.getString();
     const String& payload2 = payload;
    // Serial.println( payload2);
     payload = payload2;
    Serial.println(payload);
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  https.end();

  return payload;
}
