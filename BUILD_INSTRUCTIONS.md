# Build Instructions for Razorpay Implementation

## 🔴 Critical Issue Identified
The current backend JAR file (`backend/target/wealthwise-backend-1.0.0.jar`) is **outdated** (Last modified: Feb 5th).
The new Razorpay code (`PaymentController.java`) was added on **Feb 6th**.

Because of this specific mismatch, the running application **does not contain the Payment API**, resulting in the error:
`No static resource api/v1/payment/create-order`

## ✅ How to Fix

You must **rebuild the backend** to include the new changes.

### Option 1: Using IntelliJ IDEA / Eclipse (Recommended)
1.  Open the project in your IDE.
2.  Navigate to the Maven tool window.
3.  Run **`clean`** and then **`install`** (or `package`).
4.  Once built, run the `run-backend.ps1` script again.

### Option 2: Using Command Line (If Maven is installed)
1.  Open a terminal in `d:\HCLTech\FinTechs\wealthwise-ai\backend`.
2.  Run:
    ```powershell
    mvn clean install
    ```
3.  Restart the backend using `run-backend.ps1`.

### Option 3: If you do NOT have Maven
You must install Maven to build the project from the command line.
1.  Download Maven from [apache.org](https://maven.apache.org/download.cgi).
2.  Add `bin` folder to your PATH.
3.  Run the command in Option 2.

## Verification
After building, check the timestamp of the JAR file:
```powershell
Get-Item backend/target/wealthwise-backend-1.0.0.jar
```
It should show the **current time**.
