module.exports = {
	userdata: `[powershell]
	Set-ExecutionPolicy unrestricted -Force
  $tempDir = New-Item C:\\temp -ItemType Directory -Force
  $tempDir.attributes="Hidden"
	$instanceId = "null"
	while ($instanceId -NotLike "i-*") {
	 	Start-Sleep -s 3
	 	$instanceId = Invoke-RestMethod http://100.100.100.200/latest/meta-data/instance-id
  }
  $Logfile = "C:\\temp\\joindomain.log"
  Function Get-TimeStamp {
    return "[{0:dd/MM/yyyy} {0:HH:mm:ss}] " -f (Get-Date)
  }
  Function Log-Write {
    Param ([string]$logString)
    Add-content $Logfile -value "$(Get-TimeStamp)$logString"
  }
  Log-Write "INFO InstanceId=$instanceId"
	$interfaceIndex = (Get-NetAdapter | Where-object {$_.Name -like "*Ethernet*" } | Select-Object -ExpandProperty InterfaceIndex)
  Log-Write "INFO InterfaceIndex=$interfaceIndex Setting DNS"
  Set-DnsClientServerAddress -InterfaceIndex $interfaceIndex -ServerAddresses "${process.env.DC_PRIMARY_DNS}","${process.env.DC_SECONDARY_DNS}"
  $domain = "${process.env.DOMAIN}"
	$adminUser = "${process.env.NETBIOS}\\Administrator"
	$adminPass = "${process.env.AD_ADMIN_PASS}" | ConvertTo-SecureString -AsPlainText -Force
  $cred = New-Object -typename System.Management.Automation.PSCredential($adminUser, $adminPass)
    Try {
      Log-Write "INFO Adding computer to domain $domain"
			Add-Computer -DomainName $domain -OUPath "${process.env.OU_PATH}" -Options AccountCreate -Credential $cred -Force -Restart -ErrorAction 'Stop'
  	}
    Catch {
      Log-Write "ERROR $_.Exception"
    }
	`
}