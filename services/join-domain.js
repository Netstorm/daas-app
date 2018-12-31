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
    Try {
      $TaskName = "Notify Idle Instance"
      $service = New-Object -ComObject("Schedule.Service")
      $service.Connect()
      $rootFolder = $service.GetFolder("")
      $taskdef = $service.NewTask(0)
      $taskdef.Principal.RunLevel = 1
      $sets = $taskdef.Settings
      $sets.AllowDemandStart = $false
      $sets.Compatibility = 1
      $sets.Enabled = $true
      $sets.RunOnlyIfIdle = $true
      $sets.IdleSettings.IdleDuration = "PT10M"
      $sets.IdleSettings.WaitTimeout = "PT0M"
      $sets.IdleSettings.StopOnIdleEnd = $true
      $sets.IdleSettings.RestartOnIdle = $true
      $trg = $taskdef.Triggers.Create(6)
      $trg.Enabled = $true
      $act = $taskdef.Actions.Create(0)
      $act.Path = "powershell.exe"
      $act.Arguments = "-ExecutionPolicy Bypass -File C:\\Users\\MHUSER\\mydesktop\\NotifyIdleInstance.ps1"
      $rootFolder.RegisterTaskDefinition($TaskName, $taskdef, 6, 'Users', $null, 4)
      Log-Write "Scheduled task created"
    }
    Catch {
      Log-Write "ERROR $_.Exception"
    }
	`
}