import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`);
});

app.get("/ping", async (req: Request, res: Response) => {
  try {
    res.status(200).send({ message: "Pong!" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.get("/bands", async (req: Request, res: Response) => {
  try {
    // OPÇÃO ANTIGA:
    // const result = await db.raw(`
    //     SELECT * FROM bands;
    // `)

    // REFATORANDO - OPÇÃO 1:
    // const result = await db.select("*").from("bands") -> OUTRA OPÇÃO

    // REFATORANDO - OPÇÃO 2:
    const result = await db("bands");

    res.status(200).send(result);
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/bands", async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    const name = req.body.name;

    if (typeof id !== "string") {
      res.status(400);
      throw new Error("'id' inválido, deve ser string");
    }

    if (typeof name !== "string") {
      res.status(400);
      throw new Error("'name' inválido, deve ser string");
    }

    if (id.length < 1 || name.length < 1) {
      res.status(400);
      throw new Error("'id' e 'name' devem possuir no mínimo 1 caractere");
    }

    // OPÇÃO ANTIGA:
    // await db.raw(`
    //     INSERT INTO bands (id, name)
    //     VALUES ("${id}", "${name}");
    // `)

    // REFATORANDO - OPÇÃO 1:
    // await db.insert({ id: id, name: name }).into("bands");

    // REFATORANDO - OPÇÃO 2:
    const newBand = {
      id: id,
      name: name,
    };

    await db("bands").insert(newBand);

    res.status(200).send("Banda cadastrada com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.put("/bands/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;

    const newId = req.body.id;
    const newName = req.body.name;

    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("'id' deve ser string");
      }

      if (newId.length < 1) {
        res.status(400);
        throw new Error("'id' deve possuir no mínimo 1 caractere");
      }
    }

    if (newName !== undefined) {
      if (typeof newName !== "string") {
        res.status(400);
        throw new Error("'name' deve ser string");
      }

      if (newName.length < 1) {
        res.status(400);
        throw new Error("'name' deve possuir no mínimo 1 caractere");
      }
    }

    // OPÇÃO ANTIGA:
    // const [band] = await db.raw(`
    //         SELECT * FROM bands
    //         WHERE id = "${idToEdit}";
    //     `); // desestruturamos para encontrar o primeiro item do array

    // REFATORANDO - OPÇÃO 1:
    const [band] = await db("bands").where({ id: idToEdit });

    if (band) {
      // OPÇÃO ANTIGA:
      //   await db.raw(`
      //             UPDATE bands
      //             SET
      //                 id = "${newId || band.id}",
      //                 name = "${newName || band.name}"
      //             WHERE
      //                 id = "${idToEdit}";
      //         `);

      // REFATORANDO - OPÇÃO 1:
      // await db("bands").update({
      //     id: newId || band.id,
      //     name: newName || band.name
      // }).where({id: idToEdit})

      // REFATORANDO - OPÇÃO 2:
      const updateBand = {
        id: newId || band.id,
        name: newName || band.name,
      };

      await db("bands").update(updateBand).where({ id: idToEdit });
    } else {
      res.status(404);
      throw new Error("'id' não encontrada");
    }

    res.status(200).send({ message: "Atualização realizada com sucesso" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// NOVO ENDPOINT:

app.delete("bands/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    const [band] = await db("bands").where({ id: idToDelete });

    if (band) {
      await db("bands").del().where({ id: idToDelete });
    } else {
      res.status(404);
      throw new Error("'id' não encontrado");
    }

    res.status(200).send({ message: "Banda excluída com sucesso" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/songs", async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const bandId = req.body.bandId;

    if (typeof id !== "string") {
      res.status(400);
      throw new Error("'id' inválido, deve ser string");
    }

    if (typeof name !== "string") {
      res.status(400);
      throw new Error("'name' inválido, deve ser string");
    }

    if (typeof bandId !== "string") {
      res.status(400);
      throw new Error("'bandId' inválido, deve ser string");
    }

    if (id.length < 1 || name.length < 1 || bandId.length < 1) {
      res.status(400);
      throw new Error(
        "'id', 'name' e 'bandId' devem possuir no mínimo 1 caractere"
      );
    }

    // OPÇÃO ANTIGA:
    // await db.raw(`
    //         INSERT INTO songs (id, name, band_id)
    //         VALUES ("${id}", "${name}", "${bandId}");
    //     `);

    // REFATORANDO:
    const newSong = {
      id: id,
      name: name,
      band_id: bandId,
    };

    await db("songs").insert(newSong);

    res.status(200).send("Música cadastrada com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.put("/songs/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;

    const newId = req.body.id;
    const newName = req.body.name;
    const newBandId = req.body.bandId;

    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("'id' deve ser string");
      }

      if (newId.length < 1) {
        res.status(400);
        throw new Error("'id' deve possuir no mínimo 1 caractere");
      }
    }

    if (newName !== undefined) {
      if (typeof newName !== "string") {
        res.status(400);
        throw new Error("'name' deve ser string");
      }

      if (newName.length < 1) {
        res.status(400);
        throw new Error("'name' deve possuir no mínimo 1 caractere");
      }
    }

    if (newBandId !== undefined) {
      if (typeof newBandId !== "string") {
        res.status(400);
        throw new Error("'name' deve ser string");
      }

      if (newBandId.length < 1) {
        res.status(400);
        throw new Error("'name' deve possuir no mínimo 1 caractere");
      }
    }
    // OPÇÃO ANTIGA:
    // const [song] = await db.raw(`
    //         SELECT * FROM songs
    //         WHERE id = "${idToEdit}";
    //     `); // desestruturamos para encontrar o primeiro item do array

    const [song] = await db("songs").where({ id: idToEdit })

    if (song) {
    // OPÇÃO ANTIGA:
    //   await db.raw(`
    //             UPDATE songs
    //             SET
    //                 id = "${newId || song.id}",
    //                 name = "${newName || song.name}",
    //                 band_id = "${newBandId || song.band_id}"
    //             WHERE
    //                 id = "${idToEdit}";
    //         `);
        const updatedSong = {
            id: newId || song.id,
            name: newName || song.name,
            band_id: newBandId || song.band_id
      };

      await db("songs").update(updatedSong).where({ id: idToEdit });

    } else {
      res.status(404);
      throw new Error("'id' não encontrada");
    }

    res.status(200).send({ message: "Atualização realizada com sucesso" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.get("/songs", async (req: Request, res: Response) => {
  try {

    // OPÇÃO ANTIGA:
    // const result = await db.raw(`
    //     SELECT
    //       songs.id AS id,
    //       songs.name AS name,
    //       bands.id AS bandId,
    //       bands.name AS bandName
    //     FROM songs
    //     INNER JOIN bands
    //     ON songs.band_id = bands.id;
    //   `);
    // // referencie o notion do material assíncrono "Mais práticas com query builder"
    // // (Seções "Apelidando com ALIAS" e "Junções com JOIN")

    // REFATORANDO:
    const result = await db("songs")
        .select (
            "songs.id AS id",
            "songs.name AS name",
            "bands.id AS bandId",
            "bands.name AS bandName"
        )
        .innerJoin (
            "bands",
            "songs.band_id",
            "=",
            "bands.id"
        );

    res.status(200).send(result);
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});
