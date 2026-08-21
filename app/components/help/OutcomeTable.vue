<script setup lang="ts">
import type { HelpCell, HelpRow } from '~/types'

/**
 * Tabla de «con esto y esto, pasa esto».
 *
 * Casi todas las dudas de permisos se contestan igual: se ponen los datos de
 * entrada en las primeras columnas y el desenlace en la última. Ese desenlace va
 * como insignia de color —lo que distingue una celda de resultado de una de
 * dato es que se escribe como objeto y no como texto— para poder recorrer la
 * columna de un vistazo sin leer fila por fila.
 *
 * El «porqué» no se lleva columna propia: iría casi vacía y estiraría la tabla.
 * Va en gris junto al resultado, que es donde se lee.
 */
defineProps<{
  columns: string[]
  rows: HelpRow[]
}>()

const isBadge = (cell: HelpCell): cell is Exclude<HelpCell, string> => typeof cell !== 'string'
</script>

<template>
  <!-- La tabla no encoge por debajo de lo legible: en móvil se desplaza. -->
  <div class="overflow-x-auto">
    <table class="w-full min-w-125 text-sm">
      <thead>
        <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-dimmed">
          <th
            v-for="column in columns"
            :key="column"
            class="pb-2 pe-4 font-medium last:pe-0"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="index"
          class="border-b border-default last:border-0"
        >
          <td
            v-for="(cell, cellIndex) in row.cells"
            :key="cellIndex"
            class="py-3 pe-4 align-top last:pe-0"
            :class="!isBadge(cell) && cellIndex === 0 && 'font-medium text-highlighted'"
          >
            <template v-if="isBadge(cell)">
              <UBadge
                :label="cell.label"
                :color="cell.tone"
                variant="subtle"
                size="sm"
              />
              <span
                v-if="row.note && cellIndex === row.cells.length - 1"
                class="ms-2 text-xs text-dimmed"
              >{{ row.note }}</span>
            </template>
            <span
              v-else
              :class="cellIndex === 0 ? '' : 'text-muted'"
            >{{ cell }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
