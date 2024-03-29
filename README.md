# LaserComb
An Illustrator Extension to aid creation of finger joints when making files for laser cutting

## This script is in early development and its calculations may return values that Illustrator finds disagreeable. Please make sure to save your work before running any of the LaserComb functions!

## Installation
Check out these files in the extensions directory
```
Windows:    C:\Program Files (x86)\Common Files\Adobe\CEP\extensions

Mac:        /Library/Application Support/Adobe/CEP/extensions
```

#### Enable loading of unsigned panels
This extension is unsigned, so the following must be run in macOS:
```
defaults write /Users/<username>/Library/Preferences/com.adobe.CSXS.11.plist PlayerDebugMode 1
```

### Enable view of the LaserComb panel in Illustrator by navigating to:
Window -> Extensions -> LaserComb

## Compatibility
If the extension stops working when new versions of Illustrator are released, update the version compatibility:

```
<HostList>
    <Host Name="ILST" Version="[18.0,28.9]" />
</HostList>
```

Increment the end supported version (eg, Illustrator 2024 is version 28)

## How to Use

### Making Teeth
Select a line segment to create the teeth on.

In the LaserComb settings panel, set the following values:
* Cut away: Whether to create the Teeth on this path, or the Gaps to slot teeth into
* Tooth Width
* Gap Width - space between teeth
* Kerf - the amount of material that will be lost by your cutting process

Press “Make Teeth” to generate the finger joints.

If you have two pieces that you want to interlock, you can select the appropriate edge from each and the script will generate teeth along one segment and gaps along the second segment. A length check will be done to ensure that the pieces are of appropriate length.

It is recommended that teeth only be created on closed paths as the script cannot determine which direction to create the teeth in on an open path.

### Getting Teeth Information
Select a point along a series of teeth and press the Get Teeth Data button to see information about the teeth along an edge.

The values returned are the exact distances between the points along the path - any kerf that was applied during the teeth creation process will be represented in these values. If you wish to use these values to create matching teeth, make sure to adjust for kerf.

### Restoring Edges
The script can restore an edge by creating a straight line where teeth were.

Select a point along the edge. Press “Restore Edge” and the script will make its best attempt to find and remove any finger joints.

Beware! The restored edge is drawn through the point that you selected. This is intentional as it allows for the “fix” direction to be specified for the user on open paths. For closed paths you most likely want to restore the original bounds of your shape so make sure to select a point at the outer edge.

## Limitations
Does not respect handles for anchors - will remove any curves on a path.
