#include <iostream>
#include <string>
using namespace std;

int main() {
    int weather, visibility, fuel, engine, zone;
    cin >> weather >> visibility >> fuel >> engine >> zone;

    int weatherRisk = 0;
    int visibilityRisk = 0;
    int fuelRisk = 0;
    int engineRisk = 0;
    int zoneRisk = 0;

    // Weather: 1 Clear, 2 Rain, 3 Storm
    if (weather == 2) weatherRisk = 15;
    else if (weather == 3) weatherRisk = 30;

    // Visibility: 1 High, 2 Medium, 3 Low
    if (visibility == 2) visibilityRisk = 10;
    else if (visibility == 3) visibilityRisk = 20;

    // Fuel: 1 High, 2 Medium, 3 Low
    if (fuel == 2) fuelRisk = 10;
    else if (fuel == 3) fuelRisk = 25;

    // Engine: 1 Normal, 2 Warning, 3 Critical
    if (engine == 2) engineRisk = 15;
    else if (engine == 3) engineRisk = 30;

    // Zone: 1 Safe, 2 Sensitive, 3 Conflict
    if (zone == 2) zoneRisk = 15;
    else if (zone == 3) zoneRisk = 30;

    int riskScore = weatherRisk + visibilityRisk + fuelRisk + engineRisk + zoneRisk;

    string riskLevel;
    string recommendation;
    int confidence;

    if (riskScore <= 25) {
        riskLevel = "Low Risk";
        recommendation = "Safe to proceed. Conditions are stable.";
        confidence = 92;
    } else if (riskScore <= 55) {
        riskLevel = "Medium Risk";
        recommendation = "Proceed with caution. Monitor route and systems.";
        confidence = 81;
    } else if (riskScore <= 85) {
        riskLevel = "High Risk";
        recommendation = "Avoid departure unless reviewed by operations team.";
        confidence = 74;
    } else {
        riskLevel = "Critical Risk";
        recommendation = "Do not proceed. Immediate safety intervention required.";
        confidence = 68;
    }

    cout << riskScore << endl;
    cout << riskLevel << endl;
    cout << recommendation << endl;
    cout << confidence << endl;
    cout << weatherRisk << endl;
    cout << visibilityRisk << endl;
    cout << fuelRisk << endl;
    cout << engineRisk << endl;
    cout << zoneRisk << endl;

    return 0;
}