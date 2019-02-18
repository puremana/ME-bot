;alt+i runs the script. ensure the script and notepad doc labled invites are in the same file.
;alt a should loop endlessly - needs a time delay on repeats tho.

#MaxThreadsPerHotkey 2
SetDefaultMouseSpeed 0
SetMouseDelay 50
SetKeyDelay 1



invites := Object()
Loop, read, storage/invites.txt 
{
	invites.Insert(A_LoopReadLine)
}
for index, element in invites 
{
	name = %element%
	Click 400, 300
	Click 400, 300
	Send {Backspace 15}
	Send {DEL 15}
	Send %name%
	Sleep 300
	Click 390, 390
	Sleep 300
	Click 400, 320	
}
	