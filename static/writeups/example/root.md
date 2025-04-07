# Summary:

- [Styling](#styling)
    - [Headings](#headings)
    - [Emphasis](#emphasis)
    - [Blockquotes](#blockquotes)
    - [Horizontal Rules](#horizontal-rules)
- [Formatting](#formatting)
    - [Lists](#lists)
    - [Tables](#tables)
    - [Code](#code)
- [Links](#links)
    - [Websites](#websites)
    - [Images](#images)
    - [Anchors](#anchors)
    - [Other Files](#other-files)





# Styling

## Headings

# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

## Horizontal Rules

Three ways to do this:
___

---

***


# Formatting

## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar


## Tables

Left aligned columns

| Option | Description |
| ------ | :---------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Center aligned columns

| Option | Description |
| :-----:| :----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```
Sample text here...
```

Syntax highlighting

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```


# Links

## Websites

Plain link: http://example.org/

[link text](http://example.org/)

[hover for surprise](http://example.org/ "surprise !")



## Images

Local image: (double click to preview, hover for a surprise)
![Alt text](placeholder.jpg "Oui c'est Matthieu")

Distant image:
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"

## Anchors

Go to anchor: [Back to summary](#summary)

To know anchor references:

### anchor0

reference `#anchor0`

### AnChOr1

reference `#anchor1`

### Anch|or:-2

reference `#anchor-2` (the `-` is the only special char kept)

### Anchor3

reference `#anchor3`

### Anchor3

reference `#anchor3-1`

### Anchor3

reference `#anchor3-2`

## Other Files

Preview another markdown: [here](otherfile.md)

Go to another markdown's anchor: [otherfile.md#end](otherfile.md#end)