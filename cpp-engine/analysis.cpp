#include <iostream>
#include <string>
using namespace std;

int main() {
    int weatherRisk, visibilityRisk, windRisk, fuelRisk, engineRisk, routeRisk;
    cin >> weatherRisk >> visibilityRisk >> windRisk >> fuelRisk >> engineRisk >> routeRisk;

    int riskScore = weatherRisk + visibilityRisk + windRisk + fuelRisk + engineRisk + routeRisk;

    string riskLevel;
    string recommendation;

    if (riskScore <= 25) {
        riskLevel = "Low Risk";
        recommendation = "Safe to proceed. Weather conditions are favorable.";
    } else if (riskScore <= 55) {
        riskLevel = "Medium Risk";
        recommendation = "Proceed with caution. Monitor conditions closely.";
    } else if (riskScore <= 85) {
        riskLevel = "High Risk";
        recommendation = "High operational risk detected. Consider delay or reroute.";
    } else {
        riskLevel = "Critical Risk";
        recommendation = "Do not proceed. Conditions are unsafe for operation.";
    }

    cout << riskScore << endl;
    cout << riskLevel << endl;
    cout << recommendation << endl;

    return 0;
}