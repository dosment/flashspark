
import type { Flashcard } from './types';

// Helper function to generate options for a flashcard
const generateOptions = (
  correctAnswer: string,
  allTerms: string[],
  count: number = 3
): string[] => {
  const options = new Set<string>([correctAnswer]);
  const distractors = allTerms.filter(term => term !== correctAnswer);

  while (options.size < count + 1 && distractors.length > 0) {
    const randomIndex = Math.floor(Math.random() * distractors.length);
    options.add(distractors.splice(randomIndex, 1)[0]);
  }

  // Fallback if not enough distractors
  while (options.size < count + 1) {
    options.add(`Option ${options.size}`);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
};

const scienceData = [
  {
    chapter: 'Chapter 0: Scientific and Engineering Practices',
    terms: {
      observation: 'the act of using one or more of your senses to gather information and take note of what occurs.',
      inference: 'a logical explanation of an observation that is drawn from prior knowledge or experience.',
      hypothesis: 'a possible explanation for an observation that can be tested by scientific investigations.',
      'independent variable': 'the factor that is changed by the investigator to observe how it affects a dependent variable',
      'dependent variable': 'the factor measured or observed during an experiment',
      constants: 'the factors in an experiment that remain the same',
      'control group': 'the part of an experiment that contains the same factors as the experimental group, but the independent variable is not changed.',
      model: 'a representation of a phenomenon, a system, a process, or a solution to an engineering problem that helps people visualize or understand the concept.',
      'scientific theory': 'an explanation of observations or events based on knowledge gained from many observations and investigations.',
      'scientific law': 'a rule that describes a pattern in nature.',
      engineering: 'the application of science and mathematics to solve problems.',
      'engineering design process': 'a series of steps used to find solutions to specific problems.',
      criteria: 'are requirements or specifications for a solution to be successful.',
      constraints: 'limitations put on the design of a solution.',
      brainstorming: 'a problem-solving technique that involves individuals contributing ideas without the fear of being criticized.',
      'cost-benefit analysis': 'a process of comparing the predicted benefits and costs of a solution.',
      prototype: 'is a model that is used to test a design.',
      accuracy: 'a description of how close a measurement is to an accepted value.',
      credibility: 'is the confidence that can be placed in the truth of scientific findings.',
    }
  },
  {
      chapter: 'Chapter 1: Classification of Matter',
      terms: {
          atom: 'a small particle that is the building block of matter.',
          molecule: 'two or more atoms that are held together and that act as a unit.',
          structure: 'the way matter is arranged.',
          shape: "an object's form",
          'kinetic energy': 'the energy an object has due to its motion.',
          volume: 'the amount of space a substance takes up.',
          solid: 'matter that has a definite shape and a definite volume.',
          liquid: 'matter with a definite volume but no definite shape.',
          gas: 'matter that has no definite volume and no definite shape.',
          substance: 'matter with a composition that is always the same.',
          'physical property': 'a characteristic of matter that can be observed or measured without changing the identity of the matter.',
          mass: 'the amount of matter in an object.',
          weight: 'the gravitational pull on the mass of an object.',
          density: 'the mass per unit volume of a substance.',
          'periodic table': 'a chart of the elements arranged into rows and columns according to their physical and chemical properties.',
          metal: 'an element that is generally shiny and is easily pulled into wires or hammered into thin sheets.',
          ductility: 'the ability of a substance to be pulled into thin wires.',
          malleability: 'the ability of a substance to be hammered or rolled into sheets.',
          nonmetal: 'elements that have no metallic properties.',
          metalloid: 'an element that has physical and chemical properties of both metals and nonmetals.'
      }
  },
  {
      chapter: 'Chapter 2: Interactions of Matter',
      terms: {
          matter: 'anything that has mass and takes up space',
          'pure substance': 'matter with a composition that is always the same.',
          mixture: 'two or more substances that are physically blended but do not combine chemically.',
          'physical property': 'a characteristic of matter that can be observed or measured without changing the identity of the matter.',
          'heterogeneous mixture': 'a mixture in which two or more pure substances are not evenly mixed.',
          'homogeneous mixture': 'a mixture in which two or more pure substances are evenly mixed.',
          solution: 'another name for a homogeneous mixture.',
          dissolve: 'to form a solution by mixing evenly.',
          'physical change': "a change in size, shape, form, or state of matter that does not change the matter's identity.",
          'chemical change': 'a change in matter in which the substances that make up the matter change into other substances with different chemical and physical properties.',
          'chemical property': 'the ability or inability of a substance to combine with or change into one or more new substances.',
          'law of conservation of mass': 'law that states that the total mass of the substances before a chemical change is the same as the total mass of the substances after the chemical change.',
          'thermal energy': 'the result of the motion of all the particles, and the distance and attractions between those particles in the system.',
          precipitate: 'a solid that sometimes forms when two liquid solutions combine.'
      }
  },
  {
      chapter: 'Chapter 3: Forces and Their Interactions',
      terms: {
          force: 'a push or a pull on an object.',
          'contact force': 'a push or a pull on one object by another object that is touching it.',
          'applied force': 'a force in which one object directly pushes or pulls on another object.',
          friction: 'a contact force that resists the sliding motion of two surfaces that are touching.',
          'normal force': 'the support force exerted on an object that touches another stable object.',
          'noncontact force': 'a force that one object can apply to another object without touching it.',
          gravity: 'an attractive force that exists between all objects that have mass.',
          magnetism: 'the force exerted by magnets when they repel or attract one another',
          'net force': 'the combination of all the forces acting on an object.',
          'balanced force': 'forces acting on an object that combine and form a net force of zero.',
          'unbalanced force': 'forces acting on an object that combine and form a net force that is not zero.',
          'force pair': 'the forces two objects apply to each other.',
          "Newton's third law of motion": 'when an object applies a force on another object, the second object applies a force of the same strength on the first object but the force is in the opposite direction.'
      }
  },
  {
      chapter: 'Chapter 4: Conservation of Energy',
      terms: {
          energy: 'the ability to cause change.',
          work: 'the transfer of energy to an object by a force that makes an object move in the direction of the force.',
          'kinetic energy': 'energy due to motion.',
          'potential energy': 'stored energy due to the interactions between objects or particles.',
          'gravitational potential energy': 'stored energy due to the interactions of objects in a gravitational field.',
          'elastic potential energy': 'energy stored in objects that are compressed or stretched, such as springs and rubber bands.',
          'chemical potential energy': 'the energy released when atoms form connections.',
          system: 'a collection of objects that interact in some way.',
          'law of conservation of energy': 'states that energy is always transferring or transforming, but energy is not created or destroyed.',
          'energy transfer': 'occurs when energy is moved from one object to another.',
          'energy transformation': 'occurs when energy is changed from one form to another.',
          'source object': 'the object that provides energy for energy transfer.',
          'receiver object': 'the object that gains energy from the energy transfer.',
          wave: 'a disturbance that transfers energy from one place to another without transferring matter.',
          'mechanical wave': 'a wave that can travel only through matter.',
          medium: 'a material in which a wave travels.',
          'transverse wave': 'a wave in which the disturbance is perpendicular to the direction the wave travels.',
          'longitudinal wave': 'a wave in which the disturbance is parallel to the direction the wave travels.'
      }
  },
  {
      chapter: 'Chapter 5: The Sun-Earth-Moon System',
      terms: {
          orbit: 'the path an object follows as it moves around another object.',
          revolution: 'the orbit of one object around another object.',
          gravity: 'an attractive force that exists between all objects that have mass.',
          rotation: 'the spin of an object around its axis.',
          'rotation axis': 'the line around which an object rotates.',
          intensity: 'the amount of energy that passes through a square meter of space in one second.',
          equator: 'the imaginary line that divides Earth into the Northern and Southern Hemispheres',
          solstice: "when Earth's rotation axis is tilted directly toward or away from the Sun.",
          equinox: "when Earth's rotation axis is tilted neither toward nor away from the Sun.",
          'ocean tide': "the periodic rise and fall of the ocean's surface caused by the gravitational force between Earth and the Moon, and Earth and the Sun.",
          'daily tide': "the predictable rise and fall of the ocean's surface each day.",
          'high tide': "when the ocean's surface reaches its highest point.",
          'low tide': "when the ocean's surface reaches its lowest point.",
          'tidal range': 'the difference in water height between a high tide and a low tide.',
          'spring tide': 'the largest tidal range that occurs when the Sun, Earth, and the Moon form a straight line.',
          'neap tide': 'the lowest tidal range that occurs when the Sun, Earth, and the Moon form a right angle.'
      }
  },
  {
      chapter: "Chapter 6: Earth's Structure",
      terms: {
          biosphere: 'all the parts of Earth where there is life.',
          geosphere: "Earth's solid and molten rocks, soil and sediment.",
          sediment: 'material that forms when rocks are broken down into smaller pieces or dissolved in water.',
          magma: 'molten or liquid rock underground.',
          volcano: "a vent in Earth's crust through which molten rock flows.",
          lava: "molten rock that erupts on Earth's surface.",
          hydrosphere: 'system containing all the solid and liquid water on Earth.',
          atmosphere: 'the layer of gases surrounding Earth.',
          crust: 'the brittle, rocky, least dense, outer layer of Earth.',
          mantle: 'the thick middle layer in the solid part of Earth.',
          core: 'the dense metallic center of Earth.',
          'outer core': 'the liquid layer surrounding the inner core, mostly composed of liquid iron and nickel.',
          'inner core': 'the innermost geologic layer of Earth, a dense ball of solid iron crystals.',
          'igneous rock': 'rocks that form when magma or lava cools and crystallizes.',
          'sedimentary rock': 'rocks that form from the deposition and accumulation of pieces of pre-existing rock, chemical precipitates, and parts of once-living organisms.',
          compaction: 'a process in which the weight from the layers of sediment forces out fluids and decreases the space between sediment grains.',
          cementation: 'a process in which minerals dissolved in water crystallize between sediment grains.',
          'metamorphic rock': 'rocks that form without melting, when pre-existing rocks experience high heat, pressure, or react with fluids.',
          'rock cycle': 'the series of processes that change one type of rock into another type of rock.',
          uplift: 'the process that moves large bodies of Earth materials to higher elevations.',
          weathering: "the mechanical and chemical processes that change Earth's surface over time.",
          erosion: 'when broken down pieces of rocks are transported.',
          deposition: 'when transported sediment accumulates into layers, such as at the bottom of lakes, the ocean, along beaches, or in river valleys.'
      }
  },
  {
      chapter: "Chapter 7: Earth's Resources",
      terms: {
          'natural resource': 'part of the environment that supplies material useful or necessary for the survival of living things.',
          'energy resource': 'fuel used for heating or to generate usable power.',
          'nonrenewable resource': 'a resource that is used faster than it can be replaced by natural processes.',
          'renewable resource': 'a resource that can be replenished by natural processes at least as quickly as it is used.',
          conservation: "the careful use of Earth's materials to prevent or reduce damage to the environment and extend the lifetime of resources.",
          technology: 'the practical use of scientific knowledge, especially for industrial or commercial use.',
          efficiency: 'the ability to do something or produce something without wasting materials, time, or energy.',
          soil: 'a mixture of weathered rock, rock fragments, decayed organic matter, water, and air.',
          air: 'the mixture of invisible, odorless, tasteless gases that surrounds Earth.',
          water: 'a transparent, tasteless, odorless, colorless substance composed of the chemical elements hydrogen and oxygen.',
          poverty: 'when a community lacks the resources and requirements for a minimum standard of living',
          'energy poverty': 'the lack of access to modern energy services and products.',
          nutrient: 'a part of food used by the body to grow and survive.',
          malnutrition: 'a lack of proper nutrition that negatively affects growth and health.',
          sustainability: 'meeting human needs in ways that ensure future generations will also be able to meet their needs.',
          'air pollution': 'the contamination of air by harmful substances including gases and smoke.',
          'water pollution': 'any contamination of water with chemicals or other hazardous substances that are detrimental to human, animal, or plant health.'
      }
  },
  {
      chapter: 'Chapter 8: Living Systems and the Environment',
      terms: {
          'hierarchical organization': 'a system of organization that begins with the simplest level and each level becomes more complex.',
          species: 'a group of organisms that have similar traits and are able to produce fertile offspring.',
          organism: 'anything that has or once had all the characteristics of life.',
          population: 'all the organisms of the same species that live in the same area at the same time.',
          community: 'two or more populations of different species that live together in the same area at the same time.',
          ecosystem: 'all the living things and nonliving things in a given area.',
          biosphere: 'all the parts of Earth where there is life.',
          'biotic factor': "any living factor in an organism's environment.",
          'abiotic factor': "any nonliving factor in an organism's environment, such as soil, water, temperature, and light availability.",
          'limiting factor': 'a factor that can limit the growth of a population.',
          competition: 'the demand for resources, such as food, water, and shelter, in short supply in an ecosystem.',
          predator: 'an organism that hunts and kills other organisms for food.',
          prey: 'the organisms hunted or eaten by a predator.',
          'competitive relationship': 'a relationship involving one or more organisms that need the same resource at the same time.',
          symbiosis: 'a close, long-term relationship between two species that usually involves an exchange of food or energy.',
          mutualism: 'a symbiotic relationship in which both organisms benefit.',
          parasitism: 'a symbiotic relationship in which one organism benefits and the other is harmed.',
          commensalism: 'a symbiotic relationship that benefits one organism but does not harm or benefit the other.'
      }
  },
  {
      chapter: 'Chapter 9: Organisms and Variations',
      terms: {
          cell: 'the smallest unit of life.',
          microscope: 'an optical instrument using one or more lenses to make enlarged images of objects.',
          theory: 'an explanation of observations or events that is based on knowledge gained from many observations and investigations.',
          'cell theory': 'the theory that states that all living things are made of one or more cells, the cell is the smallest unit of life, and all new cells come from preexisting cells.',
          prokaryotic: 'a cell that does not have a nucleus or other membrane-bound organelles.',
          organelle: 'membrane-surrounded component of a eukaryotic cell with a specialized function.',
          eukaryotic: 'a cell that has a nucleus and other membrane-bound organelles.',
          unicellular: 'a living thing that is made up of only one cell.',
          multicellular: 'a living thing that is made up of two or more cells.',
          autotroph: 'an organism that can produce its own food using light, water, carbon dioxide, or other chemicals.',
          heterotroph: 'an organism that eats plants or animals for energy and nutrients.',
          trait: 'a distinguishing characteristic of an organism.',
          inheritance: 'the passing of traits from generation to generation.',
          population: 'all the organisms of the same species that live in the same area at the same time.',
          variation: 'a slight difference in an inherited trait among individual members of a species.'
      }
  }
];


export const preloadedQuizzes: { title: string; flashcards: Flashcard[] }[] =
  scienceData.map(chapterData => {
    const allTerms = Object.keys(chapterData.terms);
    const flashcards: Flashcard[] = allTerms.map(term => {
      const question = chapterData.terms[term as keyof typeof chapterData.terms];
      const answer = term;
      const options = generateOptions(answer, allTerms);
      return { question, answer, options };
    });

    return {
      title: chapterData.chapter,
      flashcards: flashcards,
    };
  });
