import { GetStaticProps } from 'next';
import { api } from '../services/api';
import Image from 'next/image';
import Link from 'next/link';
import Head from  'next/head'

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { usePlayer } from '../contexts/PlayerContext';


import styles from './home.module.scss';
import { useState } from 'react';


type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;
};

type HomeProps = {
  latestEpisodes: Array<Episode>; //propriedades para os 2 primeiros episódios
  allEpisodes: Array<Episode>; //propriedades para os episódios restantes
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  const [darkMode, setDarkMode] = useState(false);

  function toggleDarkMode() {
    
  }

  

  return (
    //console.log(props.episodes)
    <div className={styles.homepage}>
      <Head>
        <title>Podcastr | Home</title>
      </Head>

    

      <div className={styles.box}>
        <input id="checkbox" type="checkbox"/>
        <label htmlFor="checkbox"></label>
      </div>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              //o primeiro elemento retornado no map deve ter uma key, que no caso é o id
              <li key={episode.id}>
                <Image //tag <Image/> do next pois não é uma imagem própria do projeto
                  //para funcionar devemos configurar o arquivo next.config.js
                  width={192} //altura e largura que irá carregar a imagem em tela
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover" //fixações próprias da tag <Image/>
                />

                <div className={styles.episodeDetails}>
                  <Link href={`episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <div className={styles.footers}>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {allEpisodes.map((episode, index) => (
              <tr key={episode.id}>
                <td style={{ width: 72 }}>
                  <Image
                    width={120}
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />
                </td>

                <td>
                  <Link href={`episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td style={{ width: 100 }}>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      playList(episodeList, index + latestEpisodes.length)
                    }
                  >
                    <img src="/play-green.svg" alt="Tocar episódio" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  //const response = await api.get(...)
  //const data = response.data {destructuring}
  const { data } = await api.get('episodes', {
    //('http://localhost:3333/episodes?_limit=12&_sort=published_at&_order=desc')
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  /* Formatar os dados logo depois da chamada na API, não dentro da função Home,
para não precisar renderizar toda hora, entregando pro componente os dados
já formatados */

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2); //pega os 2 primeiros episódios
  const allEpisodes = episodes.slice(2, episodes.lenght); // pega os episódios restantes

  return {
    props: {
      latestEpisodes, //retorna os 2 primeiros episódios
      allEpisodes, //retorna os episódios restantes
    },
    revalidate: 60 * 60 * 8,
  };
};
