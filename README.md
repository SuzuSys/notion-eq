# Notion-Eq

**An equation numbering tool for Notion.**

## Getting Started

### Prepare Notion environment

1. Get a integration token.

1. Prepare a target page and get the page id.

1. Prepare a Multiple-Tags database and get the database id. The database must has [validate properties](#properties-of-multiple-tags-database).

### Installation

1. Install the package.

   ```shell
   npm install @suzu-sys/notion-eq
   ```

1. Create a `.env` file to the root directory, and write a token and IDs.

   ```dotenv
   NOTION_TOKEN=*********************
   PAGE_ID=*********************
   MULTIPLE_TAGS_DB_ID=*********************
   ```

### Usage

#### 1. Equations

If you want to put a equation number to a block equation, use `\tag{<\d*>}` where `<\d*>` must be replaced to `\d*`.

- Single equation number

  ```tex
  x^2 + 2x + 1 \tag{}
  ```

- Multiple equation numbers

  ```tex
  \begin{align}
  \mathbf U^T\mathbf \Sigma^{-1}\mathbf U &= \mathbf\Lambda\tag{} \\
  \mathbf\Sigma^{-1} &= \mathbf U\mathbf\Lambda\mathbf U^T\tag{}
  \end{align}
  ```

#### 2. Reference equations

In a text block, when you want to put a reference to the equation block, put the url of the equation block as a link.

![ref-single-tag](./readme_images/ref-single-tags.png)

If you put a reference to the equation block with multiple equation numbers, register the text block in the Multiple-Tags Database.

![ref-multiple-tag](./readme_images//ref-multiple-tags.png)

![Multiple-Tags database](./readme_images/multiple-tags.png)

#### 3. Execute the tool

```shell
notion-eq
```

- Before
  ![before](./readme_images/before.png)
- After
  ![after](./readme_images/after.png)

## Parameters of .env

| Parameter              | Description                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `NOTION_TOKEN`         | Integration token                                                                                            |
| `PAGE_ID`              | The ID of the page.                                                                                          |
| `MULTIPLE_TAGS_DB_ID`  | The ID of the database containing the block that references a equation block with multiple equation numbers. |
| `EQ_PREFIX` (Optional) | Prefix of a equation number.                                                                                 |
| `EQ_SUFFIX` (Optional) | Suffix of a equation number.                                                                                 |

Page and database IDs is 32-character alphanumeric strings. They can be found at the end of a Notion page or database URL.

| Type     | URL and ID part                                                                            |
| -------- | ------------------------------------------------------------------------------------------ |
| Page     | h<!---->ttps://w<!---->ww.notion.so/Sample-Page-`9a3f0c7d5b8e1f24c6d07b1e4f3a2d8c`?pvs=... |
| Database | h<!---->ttps://w<!---->ww.notion.so/`0f9b3d7ca1e45f28bdc07e2f6a3c9d14`?v=...               |

## Properties of the Multiple-Tags database

| Property         | Type  | Format                                                | Example Value                                                    |
| ---------------- | ----- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `Paragraph Link` | Title | Link to the text block                                | [Link to the block](https://github.com/SuzuSys/notion-eq#readme) |
| `Index`          | Text  | List of the index of the equation number in the block | 1,0,1                                                            |
