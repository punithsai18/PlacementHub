$ErrorActionPreference = "Stop"

$rgName = "placementhub-india-rg"
$location = "centralindia"
$suffix = $(Get-Random -Maximum 9999 -Minimum 1000)
$appName = "placementhub$suffix"

Write-Host "Starting Azure Deployment for $appName..."
Write-Host "Creating Resource Group: $rgName..."
az group create --name $rgName --location $location | Out-Null

Write-Host "1. & 2. Creating Azure App Service Plan and Web App (Node.js)"
az appservice plan create --resource-group $rgName --name "$appName-plan" --sku B1 --is-linux | Out-Null
az webapp create --resource-group $rgName --plan "$appName-plan" --name "$appName-web" --runtime "NODE:20-lts" | Out-Null

Write-Host "3. Creating Azure Storage Account (Blob Storage)"
$storageName = "$appName" + "strg"
az storage account create --name $storageName --resource-group $rgName --location $location --sku Standard_LRS | Out-Null

Write-Host "4. Creating Azure Functions App"
az functionapp create --resource-group $rgName --consumption-plan-location $location --name "$appName-func" --storage-account $storageName --runtime node --runtime-version 18 --functions-version 4 --os-type Linux | Out-Null

Write-Host "5. Creating Azure SQL Database"
$sqlServer = "$appName-sql"
$sqlUser = "placementadmin"
$sqlPass = "P@ssw0rd$suffix!"
az sql server create --name $sqlServer --resource-group $rgName --location $location --admin-user $sqlUser --admin-password $sqlPass | Out-Null
az sql db create --resource-group $rgName --server $sqlServer --name "placementhub" --service-objective Basic | Out-Null
az sql server firewall-rule create --resource-group $rgName --server $sqlServer --name "AllowAllIps" --start-ip-address 0.0.0.0 --end-ip-address 255.255.255.255 | Out-Null






Write-Host "10. Creating Azure AI Document Intelligence"
az cognitiveservices account create --name "$appName-docintel" --resource-group $rgName --location $location --kind FormRecognizer --sku F0 --yes | Out-Null

Write-Host "11. Creating Azure Cognitive Search"
# Creating standard sku (Free is limited to 1 per sub, easily conflicts. Using basic/free if possible)
try {
    az search service create --name "$appName-search" --resource-group $rgName --location $location --sku free | Out-Null
} catch {
    Write-Host "Free SKU for Search taken, using basic..."
    az search service create --name "$appName-search" --resource-group $rgName --location $location --sku basic | Out-Null
}

Write-Host "12. Creating Azure Key Vault"
# KV names must be less than 24 chars and no hyphens/underscores if possible
$kvName = "$appName" + "kv"
if ($kvName.Length -gt 24) { $kvName = $kvName.Substring(0, 24) }
az keyvault create --name $kvName --resource-group $rgName --location $location | Out-Null

Write-Host "13. Creating Application Insights + Log Analytics"
az monitor log-analytics workspace create --resource-group $rgName --workspace-name "$appName-law" | Out-Null
$workspaceId = (az monitor log-analytics workspace show --resource-group $rgName --workspace-name "$appName-law" | ConvertFrom-Json).id
az monitor app-insights component create --app "$appName-ai" --resource-group $rgName --location $location --workspace $workspaceId | Out-Null

Write-Host "14. Microsoft Entra ID - Creating App Registration"
az ad app create --display-name "$appName-auth" | Out-Null

Write-Host "`nDeployment Completed Successfully! Azure DevOps (14) must be set up via the Azure DevOps Portal (dev.azure.com)."
Write-Host "==========================="
Write-Host "IMPORTANT CREDENTIALS:"
Write-Host "Azure SQL Server: $sqlServer.database.windows.net"
Write-Host "Azure SQL User: $sqlUser"
Write-Host "Azure SQL Pass: $sqlPass"
Write-Host "App Name Prefix: $appName"
Write-Host "==========================="

