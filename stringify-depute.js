/** @typedef {import("./fetch-informations-depute").Depute} Depute */
/** @typedef {Depute['mandats'][number]} Mandat */

/**
 * @param {string} s
 * @returns {number | undefined}
 */
function trouverNombreDansOrdinal(s) {
  if (s.match(/prem/ui)) { return 1; }
  else if (s.match(/deux/ui)) { return 2; }
  else if (s.match(/trois/ui)) { return 3; }
  else if (s.match(/quatr/ui)) { return 4; }
  else if (s.match(/cinq/ui)) { return 5; }
}

/**
 *
 * @param {number | string} num
 * @param {'F' | 'M' | undefined} genre
 */
function formatOrdinal(num, genre) {
  switch (num) {
    case 1:
    case 'I':
      return genre === 'F' ? '1ère' : '1er';
    case 2:
    case 'II':
      return genre === 'F' ? '2nde' : '2nd';
    default: return `${num}e`;
  }
}

function numToSmallRoman(num) {
  const roman = [
    ['X', 10], ['IX', 9],
    ['V', 5], ['IV', 4],
    ['I', 1],
  ];
  let str = '';

  for (const [letter, value] of roman) {
    const q = Math.floor(num / value);
    num -= q * value;
    str += letter.repeat(q);
  }
  return str;
}

function formatRegime(regime) {
  if (regime.match(/République/ui)) {
    const numeroRepublique = trouverNombreDansOrdinal(regime);
    return `${formatOrdinal(numToSmallRoman(numeroRepublique))} Rép.`;
  } else if (regime.match(/Restauration/ui)) {
    const numeroRestauration = trouverNombreDansOrdinal(regime);
    return `${formatOrdinal(numToSmallRoman(numeroRestauration))} Rest.`;
  } else {
    return regime;
  }
}

function formatInstance(instance) {
  instance = instance.replace(/Assemblée nationale/ui, 'A.N.'); // https://www.youtube.com/watch?v=jwMFYcXjTbQ
  instance = instance.replace(/Chambre des députés des départements/ui, 'Chambre des députés des dépt.');
  instance = instance.replace(/Convention nationale/ui, 'Conv. nat.');
  instance = instance.replace(/constituante/ui, 'const.');
  instance = instance.replace(/législative/ui, 'législ.');
  return instance;
}

function formatLégislature(leg) {
  leg = leg.replace(/législature/ui, 'lég.');
  return leg;
}

/**
 * @param {Mandat} mandat
 */
function getOccupationPolitique(mandat) {
  if (mandat.regimePolitique.match(/Révolution/ui)) {
    // https://www2.assemblee-nationale.fr/sycomore/fiche/(num_dept)/14944
    return {
      regime: formatRegime('Révolution'),
      instance: formatInstance(mandat.legislature), // yes, it's weird but it's like that
    };
  } else {
    const [regime, instance] = mandat.regimePolitique.split(' - ');
    const legislature = mandat.legislature;
    return {
      regime: formatRegime(regime),
      instance: formatInstance(instance),
      legislature: formatLégislature(legislature),
    };
  }
}


// Date de naissance et de décès
function datesDeVieToString(depute) {
  if (depute.anneeDeces) { // est mort
    return `${depute.anneeNaissance}–${depute.anneeDeces}`;
  } else if (depute.anneeNaissance) { // a une année de naissance
    return `${depute.anneeNaissance}`;
  }
  return ''; // else missing data
}

/**
 * @param {Depute} depute
 * @returns {string}
 */
function deputeToString(depute) {
  let str = '';

  // Nom complet et dates
  if (depute.anneeNaissance || depute.anneeDeces) {
    str += `${depute.nomComplet} (${datesDeVieToString(depute)})`;
  } else {
    str += `${depute.nomComplet}`;
  }

  str += '\n\n';

  // Mandats (dans l'ordre donné par le fetcher)
  if (depute.mandats.length > 0) {
    str += depute.mandats.length === 1 ? 'Mandat :\n' : 'Mandats :\n';

    for (const mandat of depute.mandats) {
      const { anneeDebut, anneeFin } = mandat;

      const { regime, instance, legislature } = getOccupationPolitique(mandat);

      str += '• '; // puce
      if (regime && instance) {
        if (legislature) {
          str += `${regime} (${instance}) — ${legislature}`;
        } else {
          str += `${regime} (${instance})`;
        }
      } else {
      // fallback
        str += [regime, legislature, instance].filter(Boolean).join(', ') || '??';
      }

      if (anneeDebut && anneeDebut === anneeFin) { // mandat d'un an
        str += ` ${anneeDebut}`;
      } else if (anneeFin) { // a un début et une fin
        str += ` ${anneeDebut}–${anneeFin}`;
      } else if (anneeDebut) { // n'a qu'un début
        str += ` ${anneeDebut}–`;
      } // else missing data

      str += '\n';

      if (mandat.groupe) {
        str += `  · Groupe : ${mandat.groupe}\n`;
      }
      if (mandat.departement) {
        str += `  · Département : ${mandat.departement}\n`;
      }

      str = str.trim() + '\n'; // space
    }
  }

  return str;
}


/**
 * strlen but counting whole unicode glyphs
 * @param {string} s The string to measure
 */
function glyphCount(s) {
  return [...s.replace('•', '12')].length;
}

/**
 * @param {string[]} blocks
 * @returns {string[]}
 */
function splitStringToTweets(str) {
  // split lines but keep lines starting with spaces with previous lines
  const blocks = str.split(/\n(?!  )/g); // split + lookahead
  const tweetTexts = [];

  // TODO: split groups of lines bigger than 280 chars

  let currentText = '';
  for (const block of blocks) {
    const willBeTooBig = (glyphCount(currentText + block) + 10) >= 280;
    const shouldSplitHere = willBeTooBig;

    if (shouldSplitHere) {
      tweetTexts.push(currentText.trim());
      currentText = '';
    }

    currentText += block + '\n';
  }
  if (currentText.length > 0) {
    tweetTexts.push(currentText.trim());
  }

  // Add counter
  const n = tweetTexts.length;
  if (n >= 2) {
    for (let i = 0; i < n; i++) {
      tweetTexts[i] += '\n\n' + `(${i + 1}/${n})`;
    }
  }

  return tweetTexts.map(s => s.slice(0, 280)); // safety
}

function deputeToTweets(depute) {
  return splitStringToTweets(deputeToString(depute));
}

module.exports = { deputeToTweets };
