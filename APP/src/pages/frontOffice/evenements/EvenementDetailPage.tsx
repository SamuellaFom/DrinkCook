import {useEffect, useState, useCallback} from "react";
import {Evenement} from "../../../assets/ts/FranchiseInterface";
import {evenementService} from "../../../api/frontOffice/evenementService";

export default function EvenementDetail({id}: { id: string }) {
    const [evenement, setEvenement] = useState<Evenement | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvenement = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await evenementService.getById(id);
            setEvenement(data);
        } catch (err: any) {
            console.error("Erreur API:", err);
            setError(err?.message ?? "Erreur lors du chargement de l'événement.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEvenement();
    }, [fetchEvenement]);


    const fmt = (d?: string | null) =>
        d ? new Date(d).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }) : "—";

    const computeStatut = (ev: Evenement | null) => {
        if (!ev) return {label: "—", cls: "bg-gray-400"};
        const now = new Date();
        const start = new Date(ev.dateDebut);
        const end = ev.dateFin ? new Date(ev.dateFin) : null;

        if (end && now > end) return {label: "terminé", cls: "bg-gray-500"};
        if (now < start) return {label: "à venir", cls: "bg-yellow-500"};
        return {label: "en cours", cls: "bg-green-600"};
    };


    if (loading) {
        return <div className="p-4 text-gray-600">Chargement des détails…</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600">
                {error}
                <button onClick={fetchEvenement} className="ml-2 text-blue-600 hover:underline">
                    Réessayer
                </button>
            </div>
        );
    }

    if (!evenement) {
        return <div className="p-4 text-gray-500">Aucune donnée disponible.</div>;
    }

    const statut = computeStatut(evenement);


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md font-sans text-gray-900">
            <header className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold mb-1">{evenement.titre}</h1>

                <p className="text-sm text-gray-600">
                    Début : {fmt(evenement.dateDebut)}
                </p>
                <p className="text-sm text-gray-600">
                    Fin : {fmt(evenement.dateFin)}
                </p>

                {evenement?.franchise?.nom && (
                    <p className="text-xs text-gray-500 mt-1 select-none">
                        Franchise : {evenement.franchise.nom}
                    </p>
                )}

                <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${statut.cls}`}
                >
          {statut.label}
        </span>
            </header>

            <section className="mb-8">
                <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
                    Description
                </h2>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {evenement.description?.trim() ? evenement.description : "—"}
                </div>
            </section>
        </div>
    );
}