# Notion-Eq

**An equation numbering tool for Notion.**

- Automatically adds equation numbers to LaTeX blocks in Notion documents.
- Automatically replaces equation references with corresponding numbers (similar to LaTeX's `\eqref`).

## Getting Started

### Prepare Your Notion Environment

1. Obtain an integration token.

1. Identify the Notion page you want to process and get its Page ID.

1. Set up the [AlignEqRefs database](#aligneqrefs-database) and get its Database ID.

### Setup

Create a `.env` file in the current directory and add the following:

```dotenv
NOTION_TOKEN=*********************
PAGE_ID=*********************
ALIGN_EQ_REFS_DB_ID=*********************
```

### Installation (Optional)

```bash
npm i -g @suzu-sys/notion-eq
# OR use it via npx (no installation required)
```

### Usage

#### 1. Add Equation Numbers

Use `\tag{}` or `\tag{<digits>}` in your LaTeX blocks to mark equations for numbering. Any digits you enter will be overwritten with the correct number automatically.

- Equation block with a single `\tag{}`:

  ```tex
  x^2 + 2x + 1 \tag{}
  ```

- Equation block with multiple `\tag{}`s:

  ```tex
  \begin{align}
  \mathbf U^T\mathbf \Sigma^{-1}\mathbf U &= \mathbf\Lambda\tag{} \\
  \mathbf\Sigma^{-1} &= \mathbf U\mathbf\Lambda\mathbf U^T\tag{}
  \end{align}
  ```

#### 2. Reference Equations

To reference a numbered equation, insert a link to the equation block from a text block. The link title does not affect numbering.

<p align="center"><img src="./readme_images/ref-single-tags.png" alt="" width="40%" style="min-width: 500"></p>

If the equation block contains multiple `\tag{}`s, register the referencing text block in the AlignEqRefs database.

<p align="center"><img src="./readme_images/ref-multiple-tags.png" alt="" width="80%" style="min-width: 500"></p>
<p align="center"><img src="./readme_images/multiple-tags.png" alt="" width="80%" style="min-width: 500"></p>

#### 3. Run the Tool

```bash
# If installed:
notion-eq
# OR use npx
npx @suzu-sys/notion-eq
```

## Example Output

- Before
  <p align="center"><img src="./readme_images/before.png" alt="" width="80%" style="min-width: 500"></p>
- After
  <p align="center"><img src="./readme_images/after.png" alt="" width="80%" style="min-width: 500"></p>

## .env Parameters

| Parameter              | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `NOTION_TOKEN`         | Your Notion integration token                          |
| `PAGE_ID`              | The ID of the Notion page to process.                  |
| `ALIGN_EQ_REFS_DB_ID`  | The ID of the AlignEqRefs database.                    |
| `EQ_PREFIX` (Optional) | Prefix of equation number in text blocks. Default: `(` |
| `EQ_SUFFIX` (Optional) | Suffix of equation number in text blocks. Default: `)` |

> [!NOTE]  
> `EQ_PREFIX` and `EQ_SUFFIX` apply only to how equation numbers appear in text blocks, not in LaTeX blocks.

Page and database IDs are 32-character alphanumeric strings, found at the end of a Notion page or database URL.

| Type     | Example URL and ID                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------- |
| Page     | h<!---->ttps://w<!---->ww.notion.so/Sample-Page-<ins>9a3f0c7d5b8e1f24c6d07b1e4f3a2d8c</ins>?pvs=... |
| Database | h<!---->ttps://w<!---->ww.notion.so/<ins>0f9b3d7ca1e45f28bdc07e2f6a3c9d14</ins>?v=...               |

## AlignEqRefs Database

The AlignEqRefs database is used to handle references to individual equations within an equation block that contains multiple `\tag{}`s.

| Property         | Type  | Format                                                                                                                                                                                                               | Example Value                                       |
| ---------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `Paragraph Link` | Title | Link to the referencing text block. Link title does not affect numbering.                                                                                                                                            | [Link](https://github.com/SuzuSys/notion-eq#readme) |
| `Index`          | Text  | Comma-separated list of 0-based `\tag{}` indices from the equation block. Only links to blocks with multiple `\tag{}`s are counted. Each index corresponds to the order of such links in the referencing text block. | 1,0,1                                               |

> [!NOTE]  
> **Example**  
> [ref(U,0)](#2-reference-equations) and [ref(U,1)](#2-reference-equations) refer to individual equations within a block that has multiple `\tag{}`s.  
> [ref(x^2)](#2-reference-equations) refer to a block with only a single `\tag{}`.  
> If a text block contains:  
> "... [ref(U,0)](#2-reference-equations) ... [ref(x^2)](#2-reference-equations) ... [ref(U,1)](#2-reference-equations) ..."  
> then the `Index` field should be **"0,1"**.  
> Links to single-tag blocks (like [ref(x^2)](#2-reference-equations)) are ignored when determining the order.
